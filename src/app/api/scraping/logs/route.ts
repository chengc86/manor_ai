import { NextRequest, NextResponse } from 'next/server';
import { db, scrapingLogs } from '@/lib/db';
import { desc } from 'drizzle-orm';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const logs = await db
      .select()
      .from(scrapingLogs)
      .orderBy(desc(scrapingLogs.startedAt))
      .limit(limit);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch scraping logs:', error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json([]);
  }
}
