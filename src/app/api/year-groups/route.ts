import { NextResponse } from 'next/server';
import { db, yearGroups } from '@/lib/db';
import { asc } from 'drizzle-orm';

export async function GET() {
  console.log('=== YEAR GROUPS API DEBUG ===');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL value (first 50 chars):', process.env.DATABASE_URL?.substring(0, 50));
  console.log('NODE_ENV:', process.env.NODE_ENV);

  try {
    console.log('Attempting database query...');

    const groups = await db
      .select()
      .from(yearGroups)
      .orderBy(asc(yearGroups.displayOrder));

    console.log('Query successful!');
    console.log('Found year groups:', groups.length);
    console.log('Year groups data:', JSON.stringify(groups, null, 2));

    return NextResponse.json(groups);
  } catch (error) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json([]);
  }
}
