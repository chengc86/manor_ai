import { NextRequest, NextResponse } from 'next/server';
import { db, yearGroups, documents, agentSettings, dailyReminders, weeklyOverviews } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { generateReminders, generateMockResponse } from '@/lib/llm/gemini';
import { calculateWeekStartDate, formatDateForDB } from '@/lib/utils/dates';

export async function POST(request: NextRequest) {
  try {
    const { yearGroupId, weekStartDate: providedWeekStart } = await request.json();

    if (!yearGroupId) {
      return NextResponse.json(
        { error: 'yearGroupId is required' },
        { status: 400 }
      );
    }

    // Get year group
    const [yearGroup] = await db
      .select()
      .from(yearGroups)
      .where(eq(yearGroups.id, yearGroupId))
      .limit(1);

    if (!yearGroup) {
      return NextResponse.json(
        { error: 'Year group not found' },
        { status: 404 }
      );
    }

    // Calculate week start date
    const weekStartDate = providedWeekStart || formatDateForDB(calculateWeekStartDate());

    // Get weekly mailing documents for this week (school-wide)
    const weeklyMailings = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.type, 'weekly_mailing'),
          eq(documents.weekStartDate, weekStartDate),
          eq(documents.isActive, true)
        )
      );

    const mailingUrls = weeklyMailings.map((doc) => doc.s3Url);

    // Prepare PDF documents for LLM (with base64 data)
    const pdfDocuments = weeklyMailings
      .filter((doc) => doc.pdfBase64)
      .map((doc) => ({
        filename: doc.filename,
        base64: doc.pdfBase64!,
      }));

    // Get timetable for this year group
    const [timetableDoc] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.type, 'fact_sheet'),
          eq(documents.yearGroupId, yearGroupId),
          eq(documents.isActive, true)
        )
      )
      .limit(1);

    // Get settings
    const settings = await db.select().from(agentSettings);
    const promptTemplate = settings.find((s) => s.key === 'llm_prompt_template')?.value || '';
    const factSheetContent = settings.find((s) => s.key === 'fact_sheet_content')?.value || '';

    // Generate reminders using LLM
    let llmResponse;

    if (process.env.GOOGLE_GEMINI_API_KEY && process.env.GOOGLE_GEMINI_API_KEY !== 'your-gemini-api-key-here') {
      llmResponse = await generateReminders({
        weeklyMailingUrls: mailingUrls,
        pdfDocuments: pdfDocuments.length > 0 ? pdfDocuments : undefined,
        timetableJson: timetableDoc?.timetableJson || null,
        factSheetContent,
        promptTemplate,
        weekStartDate,
        yearGroupName: yearGroup.name,
      });
    } else {
      // Use mock response for development
      llmResponse = generateMockResponse(weekStartDate, yearGroup.name);
    }

    // Delete existing reminders for this year group and week
    await db
      .delete(dailyReminders)
      .where(
        and(
          eq(dailyReminders.yearGroupId, yearGroupId),
          eq(dailyReminders.weekStartDate, weekStartDate)
        )
      );

    // Insert new reminders
    for (const reminder of llmResponse.dailyReminders) {
      await db.insert(dailyReminders).values({
        yearGroupId,
        reminderDate: reminder.date,
        title: reminder.title,
        description: reminder.description,
        priority: reminder.priority,
        category: reminder.category,
        weekStartDate,
      });
    }

    // Delete existing weekly overview
    await db
      .delete(weeklyOverviews)
      .where(
        and(
          eq(weeklyOverviews.yearGroupId, yearGroupId),
          eq(weeklyOverviews.weekStartDate, weekStartDate)
        )
      );

    // Insert new weekly overview
    await db.insert(weeklyOverviews).values({
      yearGroupId,
      weekStartDate,
      summary: llmResponse.weeklyOverview.summary,
      keyHighlights: llmResponse.weeklyOverview.keyHighlights,
      importantDates: llmResponse.weeklyOverview.importantDates,
      weeklyMailingSummary: llmResponse.weeklyOverview.weeklyMailingSummary,
      factSheetSuggestions: llmResponse.factSheetSuggestions,
    });

    // Update the fact sheet content with the LLM's cleaned/updated version
    if (llmResponse.updatedFactSheet) {
      await db
        .update(agentSettings)
        .set({ value: llmResponse.updatedFactSheet })
        .where(eq(agentSettings.key, 'fact_sheet_content'));
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${llmResponse.dailyReminders.length} reminders for ${yearGroup.name}`,
      factSheetUpdated: !!llmResponse.updatedFactSheet,
      llmResponse,
    });
  } catch (error) {
    console.error('Failed to generate reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate reminders: ${errorMessage}` },
      { status: 500 }
    );
  }
}
