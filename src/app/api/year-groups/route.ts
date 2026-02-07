import { NextResponse } from 'next/server';
import { db, yearGroups } from '@/lib/db';
import { asc } from 'drizzle-orm';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const groups = await db
      .select()
      .from(yearGroups)
      .orderBy(asc(yearGroups.displayOrder));

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Failed to fetch year groups:', error instanceof Error ? error.message : error);
    return NextResponse.json([]);
  }
}
