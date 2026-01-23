import { NextRequest, NextResponse } from 'next/server';
import { db, scrapingSchedules } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const schedules = await db.select().from(scrapingSchedules);

    // Return the first schedule or a default
    const schedule = schedules[0] || {
      dayOfWeek: 5,
      timeOfDay: '09:00',
      isActive: true,
    };

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to fetch scraping schedule:', error);
    return NextResponse.json(
      { dayOfWeek: 5, timeOfDay: '09:00', isActive: true },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { dayOfWeek, timeOfDay, isActive } = await request.json();

    // Validate inputs
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      );
    }

    if (!timeOfDay || !/^\d{2}:\d{2}$/.test(timeOfDay)) {
      return NextResponse.json(
        { error: 'timeOfDay must be in HH:MM format' },
        { status: 400 }
      );
    }

    // Get existing schedule
    const existing = await db.select().from(scrapingSchedules).limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(scrapingSchedules)
        .set({
          dayOfWeek,
          timeOfDay,
          isActive: isActive ?? true,
          updatedAt: new Date(),
        })
        .where(eq(scrapingSchedules.id, existing[0].id));
    } else {
      // Insert new
      await db.insert(scrapingSchedules).values({
        dayOfWeek,
        timeOfDay,
        isActive: isActive ?? true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update scraping schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}
