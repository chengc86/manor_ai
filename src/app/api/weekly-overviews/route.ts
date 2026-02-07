import { NextRequest, NextResponse } from 'next/server';
import { db, weeklyOverviews } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearGroupId = searchParams.get('yearGroupId');
    const weekStartDate = searchParams.get('weekStartDate');

    if (!yearGroupId) {
      return NextResponse.json(
        { error: 'yearGroupId is required' },
        { status: 400 }
      );
    }

    // Try exact weekStartDate match first
    let overview = weekStartDate
      ? (await db
          .select()
          .from(weeklyOverviews)
          .where(
            and(
              eq(weeklyOverviews.yearGroupId, yearGroupId),
              eq(weeklyOverviews.weekStartDate, weekStartDate)
            )
          )
          .limit(1))[0]
      : undefined;

    // If no results, fall back to most recent overview for this year group
    if (!overview) {
      overview = (await db
        .select()
        .from(weeklyOverviews)
        .where(eq(weeklyOverviews.yearGroupId, yearGroupId))
        .orderBy(desc(weeklyOverviews.createdAt))
        .limit(1))[0];
    }

    return NextResponse.json(overview || null);
  } catch (error) {
    console.error('Failed to fetch weekly overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly overview' },
      { status: 500 }
    );
  }
}
