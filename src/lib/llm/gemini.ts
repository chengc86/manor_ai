import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromPdf } from '@/lib/pdf/extract';
import type { LLMResponse } from '@/types';

interface PdfDocument {
  filename: string;
  base64: string;
  extractedText?: string;
}

export interface GenerateRemindersInput {
  weeklyMailingUrls: string[];
  pdfDocuments?: PdfDocument[];
  timetableJson: string | null;
  factSheetContent: string | null;
  promptTemplate: string;
  weekStartDate: string;
  yearGroupName: string;
}

/**
 * Extract text from all PDFs and attach to documents
 */
async function extractPdfTexts(pdfDocuments: PdfDocument[]): Promise<PdfDocument[]> {
  const results: PdfDocument[] = [];
  for (const pdf of pdfDocuments) {
    if (!pdf.extractedText) {
      console.log(`Extracting text from ${pdf.filename}...`);
      const text = await extractTextFromPdf(pdf.base64);
      if (text) {
        console.log(`Extracted ${text.length} chars from ${pdf.filename}`);
      } else {
        console.warn(`WARNING: Failed to extract text from ${pdf.filename} - pdfjs-dist returned empty`);
      }
      results.push({ ...pdf, extractedText: text });
    } else {
      results.push(pdf);
    }
  }
  return results;
}

function buildTextPrompt(input: GenerateRemindersInput, includeExtractedText = false): string {
  let pdfSection: string;

  if (input.pdfDocuments && input.pdfDocuments.length > 0) {
    if (includeExtractedText) {
      // Include extracted text directly in prompt (for LLMs that can't read PDFs natively)
      const pdfTexts = input.pdfDocuments
        .filter(pdf => pdf.extractedText)
        .map(pdf => `=== ${pdf.filename} ===\n${pdf.extractedText}`)
        .join('\n\n');
      if (pdfTexts) {
        pdfSection = `Here are the contents extracted from ${input.pdfDocuments.length} PDF document(s) from the weekly mailing:\n\n${pdfTexts}`;
      } else {
        console.warn('WARNING: No extracted text available from any PDFs - LLM will have no PDF content');
        pdfSection = `${input.pdfDocuments.length} PDF document(s) were found but text extraction failed. No mailing content is available.`;
      }
    } else {
      pdfSection = `I have attached ${input.pdfDocuments.length} PDF document(s) from the weekly mailing. Please analyze them carefully.`;
    }
  } else {
    pdfSection = `Weekly Mailing Content:\n${input.weeklyMailingUrls.length > 0 ? input.weeklyMailingUrls.join('\n') : 'No mailings available for this week'}`;
  }

  return `${input.promptTemplate}

---

Week Starting: ${input.weekStartDate}
Year Group: ${input.yearGroupName}

${pdfSection}

Year Group Timetable (JSON):
${input.timetableJson || 'No timetable data available'}

Current Fact Sheet Content:
${input.factSheetContent || 'No fact sheet content available'}

---

Please analyze the PDF documents and other information to generate a JSON response with daily reminders, weekly overview, fact sheet suggestions, AND an updated fact sheet for ${input.yearGroupName} for the week of ${input.weekStartDate}.

Remember to:
1. Create daily reminders for each school day (Monday-Friday)
2. Consider the timetable when suggesting what to bring/prepare
3. Extract key dates and events from the mailing PDFs
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
}

function parseAndValidateResponse(text: string, factSheetContent: string | null): LLMResponse {
  let cleanedText = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = JSON.parse(cleanedText) as LLMResponse;

  if (!parsed.dailyReminders || !Array.isArray(parsed.dailyReminders)) {
    throw new Error('Invalid response: missing dailyReminders array');
  }
  if (!parsed.weeklyOverview) {
    throw new Error('Invalid response: missing weeklyOverview');
  }
  if (!parsed.factSheetSuggestions) {
    throw new Error('Invalid response: missing factSheetSuggestions');
  }
  if (!parsed.updatedFactSheet) {
    parsed.updatedFactSheet = factSheetContent || '';
  }

  return parsed;
}

/**
 * Generate reminders using Gemini (sends native PDFs via inlineData)
 */
async function generateWithGemini(input: GenerateRemindersInput): Promise<LLMResponse> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const textPrompt = buildTextPrompt(input);

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: textPrompt }
  ];

  if (input.pdfDocuments && input.pdfDocuments.length > 0) {
    console.log(`Gemini: attaching ${input.pdfDocuments.length} native PDFs`);
    for (const pdf of input.pdfDocuments) {
      console.log(`  - ${pdf.filename} (${Math.round(pdf.base64.length / 1024)}KB base64)`);
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdf.base64,
        },
      });
    }
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  const text = response.text();

  return parseAndValidateResponse(text, input.factSheetContent);
}

/**
 * Generate reminders using Claude (sends native PDFs via document content blocks)
 */
async function generateWithClaude(input: GenerateRemindersInput): Promise<LLMResponse> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Build prompt without PDF text (Claude reads PDFs natively)
  const textPrompt = buildTextPrompt(input);

  // Build content blocks: text prompt + native PDF documents
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

  // Add PDF documents as native document blocks
  if (input.pdfDocuments && input.pdfDocuments.length > 0) {
    console.log(`Claude: attaching ${input.pdfDocuments.length} native PDFs`);
    for (const pdf of input.pdfDocuments) {
      console.log(`  - ${pdf.filename} (${Math.round(pdf.base64.length / 1024)}KB base64)`);
      content.push({
        type: 'document' as const,
        source: {
          type: 'base64' as const,
          media_type: 'application/pdf' as const,
          data: pdf.base64,
        },
      });
    }
  }

  // Add the text prompt
  content.push({ type: 'text' as const, text: textPrompt });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return parseAndValidateResponse(textBlock.text, input.factSheetContent);
}

/**
 * Helper: call OpenAI-compatible API with extracted text
 */
async function callOpenAICompatible(
  apiUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  providerName: string,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`${providerName} API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error(`No text response from ${providerName}`);
  }

  return text;
}

/**
 * Generate reminders using Kimi K2.5 with extracted text
 */
async function generateWithKimi(input: GenerateRemindersInput): Promise<LLMResponse> {
  const textPrompt = buildTextPrompt(input, true);
  const text = await callOpenAICompatible(
    'https://api.moonshot.cn/v1/chat/completions',
    process.env.KIMI_API_KEY!,
    'kimi-k2-0711',
    textPrompt,
    'Kimi',
  );
  return parseAndValidateResponse(text, input.factSheetContent);
}

/**
 * Generate reminders using OpenRouter with extracted text
 */
async function generateWithOpenRouter(input: GenerateRemindersInput): Promise<LLMResponse> {
  const textPrompt = buildTextPrompt(input, true);
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
  const text = await callOpenAICompatible(
    'https://openrouter.ai/api/v1/chat/completions',
    process.env.OPENROUTER_API_KEY!,
    model,
    textPrompt,
    'OpenRouter',
    { 'X-Title': 'Manor AI' },
  );
  return parseAndValidateResponse(text, input.factSheetContent);
}

/**
 * Generate reminders with fallback chain:
 * Gemini (native PDF) -> Claude (native PDF) -> Kimi K2.5 (extracted text) -> OpenRouter (extracted text) -> Mock
 */
export async function generateReminders(input: GenerateRemindersInput): Promise<LLMResponse> {
  // Log PDF availability
  if (input.pdfDocuments && input.pdfDocuments.length > 0) {
    console.log(`=== PDF DATA CHECK ===`);
    console.log(`Total PDFs: ${input.pdfDocuments.length}`);
    for (const pdf of input.pdfDocuments) {
      console.log(`  - ${pdf.filename}: base64 length=${pdf.base64.length}, hasExtractedText=${!!pdf.extractedText}`);
    }
  } else {
    console.log('No PDF documents provided to generateReminders');
  }

  // Extract text from PDFs upfront for Kimi/OpenRouter fallbacks
  let inputWithText = input;
  if (input.pdfDocuments && input.pdfDocuments.length > 0) {
    console.log(`Extracting text from ${input.pdfDocuments.length} PDFs for text-only fallbacks...`);
    const pdfDocsWithText = await extractPdfTexts(input.pdfDocuments);
    inputWithText = { ...input, pdfDocuments: pdfDocsWithText };

    // Log extraction results
    const successCount = pdfDocsWithText.filter(p => p.extractedText && p.extractedText.length > 0).length;
    console.log(`Text extraction: ${successCount}/${pdfDocsWithText.length} PDFs extracted successfully`);
  }

  // 1. Try Gemini first (sends native PDFs)
  if (process.env.GOOGLE_GEMINI_API_KEY && process.env.GOOGLE_GEMINI_API_KEY !== 'your-gemini-api-key-here') {
    try {
      console.log('Trying Gemini 2.0 Flash (native PDF)...');
      const result = await generateWithGemini(inputWithText);
      console.log('Gemini succeeded');
      return result;
    } catch (error) {
      console.error('Gemini failed:', error instanceof Error ? error.message : error);
    }
  }

  // 2. Fallback to Claude (sends native PDFs)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Falling back to Claude (native PDF)...');
      const result = await generateWithClaude(inputWithText);
      console.log('Claude succeeded');
      return result;
    } catch (error) {
      console.error('Claude failed:', error instanceof Error ? error.message : error);
    }
  }

  // 3. Fallback to Kimi K2.5 (uses extracted text)
  if (process.env.KIMI_API_KEY) {
    try {
      console.log('Falling back to Kimi K2.5 (extracted text)...');
      const result = await generateWithKimi(inputWithText);
      console.log('Kimi succeeded');
      return result;
    } catch (error) {
      console.error('Kimi failed:', error instanceof Error ? error.message : error);
    }
  }

  // 4. Fallback to OpenRouter (uses extracted text)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log('Falling back to OpenRouter (extracted text)...');
      const result = await generateWithOpenRouter(inputWithText);
      console.log('OpenRouter succeeded');
      return result;
    } catch (error) {
      console.error('OpenRouter failed:', error instanceof Error ? error.message : error);
    }
  }

  // 5. Final fallback: mock response
  console.log('All LLMs failed, using mock response');
  return generateMockResponse(input.weekStartDate, input.yearGroupName);
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
