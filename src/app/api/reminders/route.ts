import { NextRequest, NextResponse } from 'next/server';
import { db, dailyReminders } from '@/lib/db';
import { eq, and, asc, desc } from 'drizzle-orm';

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
    let reminders = weekStartDate
      ? await db
          .select()
          .from(dailyReminders)
          .where(
            and(
              eq(dailyReminders.yearGroupId, yearGroupId),
              eq(dailyReminders.weekStartDate, weekStartDate)
            )
          )
          .orderBy(asc(dailyReminders.reminderDate))
      : [];

    // If no results, fall back to most recent reminders for this year group
    if (reminders.length === 0) {
      reminders = await db
        .select()
        .from(dailyReminders)
        .where(eq(dailyReminders.yearGroupId, yearGroupId))
        .orderBy(desc(dailyReminders.createdAt))
        .limit(20);

      if (reminders.length > 0) {
        // Filter to only reminders from the same week as the most recent one
        const latestWeek = reminders[0].weekStartDate;
        reminders = reminders.filter(r => r.weekStartDate === latestWeek);
        // Re-sort by reminder date
        reminders.sort((a, b) => (a.reminderDate > b.reminderDate ? 1 : -1));
      }
    }

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yearGroupId, reminderDate, title, description, priority, category, weekStartDate } = body;

    const [reminder] = await db
      .insert(dailyReminders)
      .values({
        yearGroupId,
        reminderDate,
        title,
        description,
        priority,
        category,
        weekStartDate,
      })
      .returning();

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Failed to create reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
