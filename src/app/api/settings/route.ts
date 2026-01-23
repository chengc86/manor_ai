import { NextRequest, NextResponse } from 'next/server';
import { db, agentSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const settings = await db.select().from(agentSettings);

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value || '';
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      const existing = await db
        .select()
        .from(agentSettings)
        .where(eq(agentSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(agentSettings)
          .set({ value: value as string, updatedAt: new Date() })
          .where(eq(agentSettings.key, key));
      } else {
        await db.insert(agentSettings).values({
          key,
          value: value as string,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
