import { NextRequest, NextResponse } from 'next/server';
import { db, yearGroups, agentSettings, scrapingSchedules } from '@/lib/db';
import { notInArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add a simple auth check with a secret
    const { secret } = await request.json().catch(() => ({}));
    const expectedSecret = process.env.SEED_SECRET || 'manor-seed-2024';

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid secret. Pass {"secret": "your-seed-secret"} in the request body.' },
        { status: 401 }
      );
    }

    console.log('Seeding database...');

    // Seed Year Groups (Year 1 and Year 5 only)
    const yearGroupsData = [
      { name: 'Year 1', displayOrder: 1 },
      { name: 'Year 5', displayOrder: 2 },
    ];

    // Remove any year groups that are not Year 1 or Year 5
    await db.delete(yearGroups).where(
      notInArray(yearGroups.name, ['Year 1', 'Year 5'])
    );

    for (const yg of yearGroupsData) {
      await db.insert(yearGroups).values(yg).onConflictDoNothing();
    }
    console.log('Year groups seeded (Year 1 and Year 5).');

    // Seed default agent settings
    const settingsData = [
      {
        key: 'scraping_url',
        value: '',
        description: 'URL of the school website to scrape for weekly mailings',
      },
      {
        key: 'scraping_password',
        value: '',
        description: 'Password for accessing protected content on the school website',
      },
      {
        key: 'llm_prompt_template',
        value: `You are an AI assistant that processes school weekly mailing PDFs, fact sheets, and timetables to extract important information for parents.

Your task is to analyze the provided documents and generate:
1. Daily reminders for each day of the upcoming week
2. A weekly overview summarizing key information
3. An updated fact sheet with expired/conflicting information removed

---

## CRITICAL: PHYSICAL EDUCATION (PE), GAMES, AND SWIMMING

You MUST carefully examine the timetable to identify days when students have:
- **PE (Physical Education)** lessons
- **Games** or **Squad Games** sessions
- **Swimming** lessons
- **Sports** activities

When you identify these activities, create a HIGH-PRIORITY reminder for that day:
- **Title**: "PE Kit Reminder" (for PE/Games) or "Swimming Kit Reminder" (for Swimming)
- **Category**: "Uniform"
- **Priority**: "high"
- **Description**: Clear instructions about what to bring:
  - PE/Games: "Remember to bring your full PE kit: sports shirt, shorts/tracksuit bottoms, trainers, and water bottle."
  - Swimming: "Remember to bring your swimming kit: swimsuit/trunks, towel, goggles, and swimming cap if required."

---

## PRIORITIZATION RULES

- **High priority**: Deadlines, mandatory events, PE/Games/Swimming kits, payment deadlines, permission slips
- **Medium priority**: Regular activities, homework submissions, club meetings, non-urgent notices
- **Low priority**: Optional events, general information, FYI announcements

---

## CATEGORIES (use consistently)

- "Homework" - Assignments and due dates
- "Events" - School events, trips, performances, assemblies
- "Uniform" - PE kits, swimming kits, special uniform days
- "Trips" - School trips and excursions requiring permission/payment
- "Payments" - Payment deadlines and financial matters
- "Clubs" - After-school clubs and activities
- "General" - General information and announcements

---

## DAILY REMINDERS GUIDELINES

- Create at least one reminder for each school day (Monday-Friday)
- ALWAYS check timetable for PE/Games/Swimming and create kit reminders
- Include specific details (times, locations, what to bring)
- Be concise but informative
- Use parent-friendly language
- All dates MUST be in YYYY-MM-DD format

---

## FACT SHEET UPDATE RULES (CRITICAL)

When generating the "updatedFactSheet" field:
1. **REMOVE** any information that has EXPIRED (past dates, completed events, old deadlines)
2. **REMOVE** any CONFLICTING information - if conflicts exist, always use the LATEST information
3. **ADD** any new PERMANENT or ONGOING information from the weekly mailing
4. **KEEP** the fact sheet concise, well-organized, and up-to-date
5. Do NOT include one-time events that have already passed
6. Preserve important recurring information (PE days, library days, regular schedules)

---

## REQUIRED JSON OUTPUT STRUCTURE

{
  "dailyReminders": [
    {
      "date": "YYYY-MM-DD",
      "title": "Short actionable title",
      "description": "Brief explanation",
      "priority": "high" | "medium" | "low",
      "category": "Homework" | "Events" | "Uniform" | "Trips" | "Payments" | "Clubs" | "General"
    }
  ],
  "weeklyOverview": {
    "summary": "2-3 sentence overview of the week",
    "keyHighlights": ["Important point 1", "Important point 2"],
    "importantDates": [{"date": "YYYY-MM-DD", "event": "Event description"}],
    "weeklyMailingSummary": {
      "mainTopics": ["Topic 1", "Topic 2"],
      "actionItems": ["Action 1", "Action 2"],
      "upcomingEvents": ["Event 1", "Event 2"]
    }
  },
  "factSheetSuggestions": {
    "additions": ["New item to add"],
    "removals": ["Outdated item to remove"]
  },
  "updatedFactSheet": "The complete, cleaned, and updated fact sheet content as a string"
}

Return ONLY valid JSON. No markdown formatting, no explanatory text outside the JSON.`,
        description: 'Prompt template for LLM when generating reminders',
      },
      {
        key: 'fact_sheet_content',
        value: '',
        description: 'Current fact sheet content for each year group',
      },
    ];

    for (const setting of settingsData) {
      await db.insert(agentSettings).values(setting).onConflictDoNothing();
    }
    console.log('Agent settings seeded.');

    // Seed default scraping schedule (Friday at 9:00 AM)
    const scheduleData = {
      dayOfWeek: 5, // Friday
      timeOfDay: '09:00',
      isActive: true,
    };

    await db.insert(scrapingSchedules).values(scheduleData).onConflictDoNothing();
    console.log('Scraping schedule seeded (Friday 9:00 AM).');

    // Verify the data
    const groups = await db.select().from(yearGroups);
    const settings = await db.select().from(agentSettings);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        yearGroups: groups.map(g => g.name),
        settingsKeys: settings.map(s => s.key),
      }
    });
  } catch (error) {
    console.error('Seeding failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Seeding failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
