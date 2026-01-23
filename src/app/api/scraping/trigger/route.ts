import { NextResponse } from 'next/server';
import { scrapeWeeklyMailings } from '@/lib/scraper';

export async function POST() {
  try {
    const result = await scrapeWeeklyMailings();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Scraping completed. ${result.documentsProcessed} of ${result.documentsFound} documents processed.`,
        documentsFound: result.documentsFound,
        documentsProcessed: result.documentsProcessed,
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
    return NextResponse.json(
      { error: 'Failed to trigger scraping' },
      { status: 500 }
    );
  }
}
