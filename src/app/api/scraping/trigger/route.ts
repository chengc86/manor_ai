import { NextResponse } from 'next/server';
import { scrapeWeeklyMailings } from '@/lib/scraper';
import { db, yearGroups, documents, agentSettings, dailyReminders, weeklyOverviews } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { generateReminders, generateMockResponse } from '@/lib/llm/gemini';
import { calculateWeekStartDate, formatDateForDB } from '@/lib/utils/dates';

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

    // Generate reminders using LLM
    let llmResponse;

    if (process.env.GOOGLE_GEMINI_API_KEY && process.env.GOOGLE_GEMINI_API_KEY !== 'your-gemini-api-key-here') {
      llmResponse = await generateReminders({
        weeklyMailingUrls: mailingUrls,
        timetableJson: timetableDoc?.timetableJson || null,
        factSheetContent,
        promptTemplate,
        weekStartDate,
        yearGroupName,
      });
    } else {
      // Use mock response for development
      llmResponse = generateMockResponse(weekStartDate, yearGroupName);
    }

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

export async function POST() {
  try {
    const result = await scrapeWeeklyMailings();

    if (result.success) {
      // If documents were successfully processed, generate reminders for all year groups
      let reminderResults: { yearGroup: string; success: boolean; remindersCount?: number; error?: string }[] = [];

      if (result.documentsProcessed > 0) {
        console.log('Scraping successful, generating reminders for all year groups...');

        const allYearGroups = await db.select().from(yearGroups);
        const weekStartDate = formatDateForDB(calculateWeekStartDate());

        for (const yg of allYearGroups) {
          const genResult = await generateRemindersForYearGroup(yg.id, yg.name, weekStartDate);
          reminderResults.push({
            yearGroup: yg.name,
            success: genResult.success,
            remindersCount: genResult.success ? genResult.remindersCount : undefined,
            error: genResult.success ? undefined : genResult.error,
          });
        }

        console.log('Reminder generation completed:', reminderResults);
      }

      return NextResponse.json({
        success: true,
        message: `Scraping completed. ${result.documentsProcessed} of ${result.documentsFound} documents processed.`,
        documentsFound: result.documentsFound,
        documentsProcessed: result.documentsProcessed,
        reminderGeneration: reminderResults.length > 0 ? reminderResults : 'No documents processed, skipped reminder generation',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          documentsFound: result.documentsFound,
          documentsProcessed: result.documentsProcessed,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to trigger scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to trigger scraping', details: errorMessage },
      { status: 500 }
    );
  }
}
