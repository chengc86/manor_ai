import { NextResponse } from 'next/server';
import { db, yearGroups } from '@/lib/db';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Fetching year groups...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

    const groups = await db
      .select()
      .from(yearGroups)
      .orderBy(asc(yearGroups.displayOrder));

    console.log('Found year groups:', groups.length);
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Failed to fetch year groups:', error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json([]);
  }
}
