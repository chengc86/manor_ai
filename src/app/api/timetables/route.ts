import { NextRequest, NextResponse } from 'next/server';
import { db, documents } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearGroupId = searchParams.get('yearGroupId');

    if (!yearGroupId) {
      return NextResponse.json(
        { error: 'yearGroupId is required' },
        { status: 400 }
      );
    }

    const [timetable] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.yearGroupId, yearGroupId),
          eq(documents.type, 'fact_sheet'),
          eq(documents.isActive, true)
        )
      )
      .limit(1);

    return NextResponse.json({
      yearGroupId,
      timetableJson: timetable?.timetableJson || '',
    });
  } catch (error) {
    console.error('Failed to fetch timetable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { yearGroupId, timetableJson } = await request.json();

    if (!yearGroupId) {
      return NextResponse.json(
        { error: 'yearGroupId is required' },
        { status: 400 }
      );
    }

    // Check if a timetable document exists for this year group
    const [existing] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.yearGroupId, yearGroupId),
          eq(documents.type, 'fact_sheet'),
          eq(documents.isActive, true)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(documents)
        .set({
          timetableJson,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, existing.id));
    } else {
      // Create new
      await db.insert(documents).values({
        type: 'fact_sheet',
        yearGroupId,
        filename: `timetable-${yearGroupId}.json`,
        s3Key: '',
        s3Url: '',
        mimeType: 'application/json',
        timetableJson,
        isActive: true,
        version: 1,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update timetable:', error);
    return NextResponse.json(
      { error: 'Failed to update timetable' },
      { status: 500 }
    );
  }
}
