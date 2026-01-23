import { NextRequest, NextResponse } from 'next/server';
import { db, dailyReminders } from '@/lib/db';
import { eq, and, asc } from 'drizzle-orm';

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

    const reminders = await db
      .select()
      .from(dailyReminders)
      .where(
        and(
          eq(dailyReminders.yearGroupId, yearGroupId),
          eq(dailyReminders.weekStartDate, weekStartDate)
        )
      )
      .orderBy(asc(dailyReminders.reminderDate));

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
