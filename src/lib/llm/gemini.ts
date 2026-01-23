import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMResponse } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface GenerateRemindersInput {
  weeklyMailingUrls: string[];
  timetableJson: string | null;
  factSheetContent: string | null;
  promptTemplate: string;
  weekStartDate: string;
  yearGroupName: string;
}

/**
 * Generate reminders and weekly overview using Gemini
 */
export async function generateReminders(input: GenerateRemindersInput): Promise<LLMResponse> {
  // Using Gemini 3 Pro Preview - Google's most advanced reasoning model
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

  const prompt = `${input.promptTemplate}

---

Week Starting: ${input.weekStartDate}
Year Group: ${input.yearGroupName}

Weekly Mailing PDF URLs:
${input.weeklyMailingUrls.length > 0 ? input.weeklyMailingUrls.join('\n') : 'No mailings available for this week'}

Year Group Timetable (JSON):
${input.timetableJson || 'No timetable data available'}

Current Fact Sheet Content:
${input.factSheetContent || 'No fact sheet content available'}

---

Please analyze the above information and generate the JSON response with daily reminders, weekly overview, fact sheet suggestions, AND an updated fact sheet for ${input.yearGroupName} for the week of ${input.weekStartDate}.

Remember to:
1. Create daily reminders for each school day (Monday-Friday)
2. Consider the timetable when suggesting what to bring/prepare
3. Extract key dates and events from the mailing
4. Suggest updates to the fact sheet based on new information

IMPORTANT - Fact Sheet Update Rules:
5. Generate an "updatedFactSheet" field containing the cleaned and updated fact sheet content
6. REMOVE any information that has expired (past dates, completed events)
7. REMOVE any conflicting information - if there are conflicts, always use the LATEST information
8. ADD any new permanent or ongoing information from the weekly mailing
9. Keep the fact sheet concise and well-organized

The JSON response MUST include:
- dailyReminders: array of reminders
- weeklyOverview: object with summary, keyHighlights, importantDates, weeklyMailingSummary
- factSheetSuggestions: object with additions and removals arrays
- updatedFactSheet: string containing the full updated fact sheet content

Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON
    const parsed = JSON.parse(cleanedText) as LLMResponse;

    // Validate structure
    if (!parsed.dailyReminders || !Array.isArray(parsed.dailyReminders)) {
      throw new Error('Invalid response: missing dailyReminders array');
    }

    if (!parsed.weeklyOverview) {
      throw new Error('Invalid response: missing weeklyOverview');
    }

    if (!parsed.factSheetSuggestions) {
      throw new Error('Invalid response: missing factSheetSuggestions');
    }

    // Ensure updatedFactSheet exists, default to original if not provided
    if (!parsed.updatedFactSheet) {
      parsed.updatedFactSheet = input.factSheetContent || '';
    }

    return parsed;
  } catch (error) {
    console.error('Error generating reminders with Gemini:', error);
    throw error;
  }
}

/**
 * Generate a mock response for development/testing
 */
export function generateMockResponse(weekStartDate: string, yearGroupName: string): LLMResponse {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const categories = ['homework', 'event', 'uniform', 'equipment', 'activity'];
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

  const dailyReminders = days.map((day, index) => {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + index);

    return {
      date: date.toISOString().split('T')[0],
      title: `${day} reminder for ${yearGroupName}`,
      description: `Remember to prepare for ${day}'s activities. Check your bag the night before.`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
    };
  });

  return {
    dailyReminders,
    weeklyOverview: {
      summary: `This week ${yearGroupName} has several exciting activities planned. Make sure to check the daily reminders for specific preparation needs.`,
      keyHighlights: [
        'PE kit needed on Tuesday and Thursday',
        'Library books due Wednesday',
        'Spelling test on Friday',
      ],
      importantDates: [
        { date: weekStartDate, event: 'Start of new topic in Science' },
        {
          date: new Date(new Date(weekStartDate).getTime() + 4 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          event: 'Assembly presentation',
        },
      ],
      weeklyMailingSummary: {
        mainTopics: ['Upcoming school trip', 'New reading challenge', 'Parent consultation dates'],
        actionItems: ['Return permission slips', 'Update contact details', 'Book consultation slots'],
        upcomingEvents: ['School trip in 2 weeks', 'Sports day planning', 'End of term celebration'],
      },
    },
    factSheetSuggestions: {
      additions: ['New PE schedule starts next month', 'Updated lunch menu options'],
      removals: ['Old Christmas event dates', 'Outdated uniform supplier info'],
    },
    updatedFactSheet: `${yearGroupName} Fact Sheet (Updated)

Key Information:
- PE days: Tuesday and Thursday
- Library day: Wednesday
- Spelling test: Every Friday

Ongoing Activities:
- Reading challenge in progress
- Science topic: Forces and Motion

Upcoming Events:
- School trip (date TBC)
- Sports day planning underway
- End of term celebration

Contact Information:
- Class teacher available via school office
- School website for latest updates`,
  };
}
