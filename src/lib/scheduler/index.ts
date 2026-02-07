import cron from 'node-cron';
import { scrapeWeeklyMailings } from '@/lib/scraper';
import { db, scrapingSchedules, yearGroups, documents, agentSettings, dailyReminders, weeklyOverviews } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { generateReminders } from '@/lib/llm/gemini';
import { calculateWeekStartDate, formatDateForDB } from '@/lib/utils/dates';

let scheduledTask: cron.ScheduledTask | null = null;

/**
 * Generate reminders for a specific year group
 */
async function generateRemindersForYearGroup(yearGroupId: string, yearGroupName: string, weekStartDate: string) {
  try {
    // Get weekly mailing documents for this week (school-wide)
    const weeklyMailings = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.type, 'weekly_mailing'),
          eq(documents.weekStartDate, weekStartDate),
          eq(documents.isActive, true)
        )
      );

    const mailingUrls = weeklyMailings.map((doc) => doc.s3Url);

    // Prepare PDF documents for LLM (with base64 data)
    const pdfDocuments = weeklyMailings
      .filter((doc) => doc.pdfBase64)
      .map((doc) => ({
        filename: doc.filename,
        base64: doc.pdfBase64!,
        extractedText: doc.timetableJson || undefined,
      }));

    // Get timetable for this year group
    const [timetableDoc] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.type, 'fact_sheet'),
          eq(documents.yearGroupId, yearGroupId),
          eq(documents.isActive, true)
        )
      )
      .limit(1);

    // Get settings
    const settings = await db.select().from(agentSettings);
    const promptTemplate = settings.find((s) => s.key === 'llm_prompt_template')?.value || '';
    const factSheetContent = settings.find((s) => s.key === 'fact_sheet_content')?.value || '';

    // Generate reminders using LLM (full fallback chain)
    const llmResponse = await generateReminders({
      weeklyMailingUrls: mailingUrls,
      pdfDocuments: pdfDocuments.length > 0 ? pdfDocuments : undefined,
      timetableJson: timetableDoc?.timetableJson || null,
      factSheetContent,
      promptTemplate,
      weekStartDate,
      yearGroupName,
    });

    // Delete existing reminders for this year group and week
    await db
      .delete(dailyReminders)
      .where(
        and(
          eq(dailyReminders.yearGroupId, yearGroupId),
          eq(dailyReminders.weekStartDate, weekStartDate)
        )
      );

    // Insert new reminders
    for (const reminder of llmResponse.dailyReminders) {
      await db.insert(dailyReminders).values({
        yearGroupId,
        reminderDate: reminder.date,
        title: reminder.title,
        description: reminder.description,
        priority: reminder.priority,
        category: reminder.category,
        weekStartDate,
      });
    }

    // Delete existing weekly overview
    await db
      .delete(weeklyOverviews)
      .where(
        and(
          eq(weeklyOverviews.yearGroupId, yearGroupId),
          eq(weeklyOverviews.weekStartDate, weekStartDate)
        )
      );

    // Insert new weekly overview
    await db.insert(weeklyOverviews).values({
      yearGroupId,
      weekStartDate,
      summary: llmResponse.weeklyOverview.summary,
      keyHighlights: llmResponse.weeklyOverview.keyHighlights,
      importantDates: llmResponse.weeklyOverview.importantDates,
      weeklyMailingSummary: llmResponse.weeklyOverview.weeklyMailingSummary,
      factSheetSuggestions: llmResponse.factSheetSuggestions,
    });

    // Update the fact sheet content with the LLM's cleaned/updated version
    if (llmResponse.updatedFactSheet) {
      await db
        .update(agentSettings)
        .set({ value: llmResponse.updatedFactSheet })
        .where(eq(agentSettings.key, 'fact_sheet_content'));
    }

    return { success: true, remindersCount: llmResponse.dailyReminders.length };
  } catch (error) {
    console.error(`Failed to generate reminders for ${yearGroupName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Initialize the scraping schedule from database settings
 */
export async function initializeScheduler() {
  // Get schedule from database
  const schedules = await db.select().from(scrapingSchedules).where(eq(scrapingSchedules.isActive, true));
  const schedule = schedules[0] || { dayOfWeek: 5, timeOfDay: '09:00' };

  // Parse time
  const [hour, minute] = schedule.timeOfDay.split(':').map(Number);

  // Build cron expression: minute hour * * dayOfWeek
  const cronExpression = `${minute} ${hour} * * ${schedule.dayOfWeek}`;

  scheduledTask = cron.schedule(
    cronExpression,
    async () => {
      console.log('Starting scheduled weekly mailing scrape...');

      try {
        const result = await scrapeWeeklyMailings();

        if (result.success) {
          console.log(`Scraping completed: ${result.documentsProcessed} documents processed`);

          // If documents were processed, generate reminders for all year groups
          if (result.documentsProcessed > 0) {
            console.log('Generating reminders for all year groups...');

            const allYearGroups = await db.select().from(yearGroups);
            const weekStartDate = formatDateForDB(calculateWeekStartDate());

            for (const yg of allYearGroups) {
              const genResult = await generateRemindersForYearGroup(yg.id, yg.name, weekStartDate);
              if (genResult.success) {
                console.log(`Generated ${genResult.remindersCount} reminders for ${yg.name}`);
              } else {
                console.error(`Failed to generate reminders for ${yg.name}: ${genResult.error}`);
              }
            }

            console.log('Reminder generation completed.');
          }
        } else {
          console.error(`Scraping failed: ${result.error}`);
        }

        // Update schedule record
        const currentSchedules = await db.select().from(scrapingSchedules).where(eq(scrapingSchedules.isActive, true));

        if (currentSchedules.length > 0) {
          await db
            .update(scrapingSchedules)
            .set({
              lastRunAt: new Date(),
              nextRunAt: getNextScheduledRun(currentSchedules[0].dayOfWeek, currentSchedules[0].timeOfDay),
            })
            .where(eq(scrapingSchedules.id, currentSchedules[0].id));
        }
      } catch (error) {
        console.error('Scheduled scraping error:', error);
      }
    },
    {
      timezone: 'Europe/London', // GMT timezone
    }
  );

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log(`Scheduler initialized - will run every ${dayNames[schedule.dayOfWeek]} at ${schedule.timeOfDay} GMT`);
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('Scheduler stopped');
  }
}

/**
 * Get the next scheduled run date based on configured day and time
 */
function getNextScheduledRun(dayOfWeek: number, timeOfDay: string): Date {
  const [hour, minute] = timeOfDay.split(':').map(Number);
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntilNext = (dayOfWeek - currentDay + 7) % 7;

  // If it's the same day but the time has passed, schedule for next week
  if (daysUntilNext === 0) {
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour, minute, 0, 0);
    if (now >= scheduledTime) {
      daysUntilNext = 7;
    }
  }

  const nextRun = new Date(now);
  nextRun.setDate(now.getDate() + daysUntilNext);
  nextRun.setHours(hour, minute, 0, 0);
  return nextRun;
}

/**
 * Check if scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return scheduledTask !== null;
}
