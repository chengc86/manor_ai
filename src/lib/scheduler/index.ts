import cron from 'node-cron';
import { scrapeWeeklyMailings } from '@/lib/scraper';
import { db, scrapingSchedules } from '@/lib/db';
import { eq } from 'drizzle-orm';

let scheduledTask: cron.ScheduledTask | null = null;

/**
 * Initialize the Friday scraping schedule
 */
export function initializeScheduler() {
  // Default: Every Friday at 9:00 AM
  const cronExpression = '0 9 * * 5'; // 5 = Friday

  scheduledTask = cron.schedule(
    cronExpression,
    async () => {
      console.log('Starting scheduled weekly mailing scrape...');

      try {
        const result = await scrapeWeeklyMailings();

        if (result.success) {
          console.log(`Scraping completed: ${result.documentsProcessed} documents processed`);
        } else {
          console.error(`Scraping failed: ${result.error}`);
        }

        // Update schedule record
        const schedules = await db.select().from(scrapingSchedules).where(eq(scrapingSchedules.isActive, true));

        if (schedules.length > 0) {
          await db
            .update(scrapingSchedules)
            .set({
              lastRunAt: new Date(),
              nextRunAt: getNextFriday(),
            })
            .where(eq(scrapingSchedules.id, schedules[0].id));
        }
      } catch (error) {
        console.error('Scheduled scraping error:', error);
      }
    },
    {
      timezone: 'Europe/London', // GMT timezone
    }
  );

  console.log('Scheduler initialized - will run every Friday at 9:00 AM GMT');
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
 * Get the next Friday date
 */
function getNextFriday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(9, 0, 0, 0);
  return nextFriday;
}

/**
 * Check if scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return scheduledTask !== null;
}
