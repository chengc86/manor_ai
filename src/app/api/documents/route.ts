import { NextRequest, NextResponse } from 'next/server';
import { db, documents } from '@/lib/db';
import { eq, and, desc, isNull } from 'drizzle-orm';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const yearGroupId = searchParams.get('yearGroupId');
    const weekStartDate = searchParams.get('weekStartDate');

    let query = db.select().from(documents);

    const conditions = [];

    if (type) {
      conditions.push(eq(documents.type, type as 'weekly_mailing' | 'fact_sheet'));
    }

    if (yearGroupId === 'null' || yearGroupId === '') {
      conditions.push(isNull(documents.yearGroupId));
    } else if (yearGroupId) {
      conditions.push(eq(documents.yearGroupId, yearGroupId));
    }

    if (weekStartDate) {
      conditions.push(eq(documents.weekStartDate, weekStartDate));
    }

    conditions.push(eq(documents.isActive, true));

    const docs = await db
      .select()
      .from(documents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(documents.createdAt));

    return NextResponse.json(docs);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json([]);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    await db
      .update(documents)
      .set({ isActive: false })
      .where(eq(documents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
