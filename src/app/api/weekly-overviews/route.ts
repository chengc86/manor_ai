import { NextRequest, NextResponse } from 'next/server';
import { db, weeklyOverviews } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearGroupId = searchParams.get('yearGroupId');
    const weekStartDate = searchParams.get('weekStartDate');

    if (!yearGroupId || !weekStartDate) {
      return NextResponse.json(
        { error: 'yearGroupId and weekStartDate are required' },
        { status: 400 }
      );
    }

    const [overview] = await db
      .select()
      .from(weeklyOverviews)
      .where(
        and(
          eq(weeklyOverviews.yearGroupId, yearGroupId),
          eq(weeklyOverviews.weekStartDate, weekStartDate)
        )
      )
      .limit(1);

    return NextResponse.json(overview || null);
  } catch (error) {
    console.error('Failed to fetch weekly overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly overview' },
      { status: 500 }
    );
  }
}
