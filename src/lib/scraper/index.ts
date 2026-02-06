import puppeteer, { Browser } from 'puppeteer';
import { db, scrapingLogs, documents, agentSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { calculateWeekStartDate, formatDateForDB } from '@/lib/utils/dates';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ScrapingResult {
  success: boolean;
  documentsFound: number;
  documentsProcessed: number;
  error?: string;
}

interface LogStep {
  timestamp: string;
  message: string;
  step: number;
}

/**
 * Main scraping function following the detailed 12-step process
 */
export async function scrapeWeeklyMailings(): Promise<ScrapingResult> {
  let browser: Browser | null = null;
  let logId: string | null = null;
  const logDetails: LogStep[] = [];
  let documentsFound = 0;
  let documentsProcessed = 0;

  const addLog = (step: number, message: string) => {
    logDetails.push({
      timestamp: new Date().toISOString(),
      message,
      step,
    });
    console.log(`[Step ${step}] ${message}`);
  };

  try {
    // Create initial scraping log
    const [log] = await db
      .insert(scrapingLogs)
      .values({
        status: 'running',
        logDetails: [],
      })
      .returning();
    logId = log.id;

    // Get settings from database
    const settings = await db.select().from(agentSettings);
    const scrapingUrl = settings.find((s) => s.key === 'scraping_url')?.value;
    const scrapingPassword = settings.find((s) => s.key === 'scraping_password')?.value;

    if (!scrapingUrl) {
      throw new Error('Scraping URL not configured in settings');
    }

    addLog(1, 'Launching browser in headless mode');
    // Step 1 - Browser Setup
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    addLog(2, `Navigating to ${scrapingUrl}`);
    // Step 2 - Navigate to Target
    await page.goto(scrapingUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    addLog(3, 'Handling cookie consent');
    // Step 3 - Cookie Consent
    try {
      const acceptButtonSelectors = [
        'button[contains(text(), "Accept")]',
        'button:has-text("Accept All")',
        '[data-testid="cookie-accept"]',
        '#accept-cookies',
        '.cookie-accept',
        'button.accept',
      ];

      for (const selector of acceptButtonSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          await wait(1000);
          break;
        } catch {
          continue;
        }
      }
    } catch {
      addLog(3, 'No cookie consent banner found or already accepted');
    }

    addLog(4, 'Pressing ESC key to dismiss popups');
    // Step 4 - CRITICAL ESC KEY PRESS
    await page.keyboard.press('Escape');
    await wait(1000);

    addLog(5, 'Authenticating with password');
    // Step 5 - Password Authentication
    if (scrapingPassword) {
      try {
        // First try to find a visible password input
        let passwordInput = await page.$('input[type="password"]');

        if (!passwordInput) {
          // If no password input found, use Tab navigation to reach it
          addLog(5, 'No visible password input, using Tab navigation');

          // Press Tab multiple times to navigate to the password field
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab');
            await wait(200);

            // Check if we've focused on a password input
            const focusedElement = await page.evaluate(() => {
              const el = document.activeElement;
              return el ? {
                tagName: el.tagName,
                type: (el as HTMLInputElement).type || '',
              } : null;
            });

            if (focusedElement?.type === 'password') {
              addLog(5, `Found password field after ${i + 1} Tab presses`);
              break;
            }
          }
        } else {
          // Click on the password input to focus it
          await passwordInput.click();
        }

        // Type the password
        await page.keyboard.type(scrapingPassword);
        addLog(5, 'Password entered');

        // Press Enter to submit
        await page.keyboard.press('Enter');
        addLog(5, 'Submitted password with Enter key');

        // Wait for navigation or content to load
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
          addLog(5, 'No navigation after password submit, continuing...');
        });

      } catch (error) {
        addLog(5, `Password authentication skipped or failed: ${error}`);
      }
    }

    addLog(6, 'Waiting 10 seconds for content to load');
    // Step 6 - Content Loading Wait
    await wait(10000);

    addLog(7, 'Detecting PDF links on page');
    // Step 7 - PDF Link Detection
    const pdfLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*=".pdf"]'));
      return links.map((link) => ({
        href: (link as HTMLAnchorElement).href,
        text: (link as HTMLAnchorElement).textContent?.trim() || 'Unknown',
      }));
    });

    documentsFound = pdfLinks.length;
    addLog(7, `Found ${documentsFound} PDF links`);

    // Step 9 - Week Date Calculation
    const weekStartDate = calculateWeekStartDate();
    const weekStartDateStr = formatDateForDB(weekStartDate);
    addLog(9, `Week start date calculated: ${weekStartDateStr}`);

    addLog(8, 'Downloading and parsing PDFs');
    // Step 8 - Download PDFs while authenticated and extract text
    for (const pdfLink of pdfLinks) {
      try {
        const filename = pdfLink.href.split('/').pop() || 'document.pdf';

        // Download PDF using authenticated browser context
        const pdfBuffer = await page.evaluate(async (url: string) => {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(arrayBuffer));
        }, pdfLink.href);

        const buffer = Buffer.from(pdfBuffer);

        // Convert PDF to base64 for LLM processing (Gemini reads PDFs natively)
        const pdfBase64 = buffer.toString('base64');
        addLog(10, `Downloaded ${filename}: ${buffer.length} bytes`);

        await db.insert(documents).values({
          type: 'weekly_mailing',
          yearGroupId: null, // School-wide
          weekStartDate: weekStartDateStr,
          filename,
          s3Key: pdfLink.href,
          s3Url: pdfLink.href,
          mimeType: 'application/pdf',
          fileSize: buffer.length,
          pdfBase64: pdfBase64, // Store PDF for direct LLM processing
          isActive: true,
          version: 1,
        });

        documentsProcessed++;
        addLog(10, `Stored: ${filename}`);
      } catch (error) {
        addLog(10, `Failed to process ${pdfLink.href}: ${error}`);
      }
    }

    addLog(11, 'Updating scraping log with results');
    // Step 11 - Logging
    await db
      .update(scrapingLogs)
      .set({
        status: 'completed',
        completedAt: new Date(),
        documentsFound,
        documentsProcessed,
        logDetails,
      })
      .where(eq(scrapingLogs.id, logId));

    addLog(12, `Scraping completed: ${documentsProcessed}/${documentsFound} documents processed`);
    // Step 12 - Admin Notification (could be email/webhook in production)

    return {
      success: true,
      documentsFound,
      documentsProcessed,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLog(0, `Scraping failed: ${errorMessage}`);

    if (logId) {
      await db
        .update(scrapingLogs)
        .set({
          status: 'failed',
          completedAt: new Date(),
          documentsFound,
          documentsProcessed,
          errorMessage,
          logDetails,
        })
        .where(eq(scrapingLogs.id, logId));
    }

    return {
      success: false,
      documentsFound,
      documentsProcessed,
      error: errorMessage,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
