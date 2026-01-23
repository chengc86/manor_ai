export interface ReminderDisplay {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  category: string | null;
  reminderDate: string;
}

export interface WeeklyOverviewDisplay {
  id: string;
  summary: string | null;
  keyHighlights: string[] | null;
  importantDates: { date: string; event: string }[] | null;
  weeklyMailingSummary: {
    mainTopics: string[];
    actionItems: string[];
    upcomingEvents: string[];
  } | null;
  factSheetSuggestions: {
    additions: string[];
    removals: string[];
  } | null;
  pdfDocuments?: { id: string; filename: string; s3Url: string }[];
}

export interface YearGroupDisplay {
  id: string;
  name: string;
  displayOrder: number;
}

export interface DocumentDisplay {
  id: string;
  type: 'weekly_mailing' | 'fact_sheet';
  yearGroupId: string | null;
  weekStartDate: string | null;
  filename: string;
  s3Url: string;
  fileSize: number | null;
  createdAt: Date;
}

export interface ScrapingLogDisplay {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt: Date | null;
  documentsFound: number | null;
  documentsProcessed: number | null;
  errorMessage: string | null;
}

export interface LLMResponse {
  dailyReminders: {
    date: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }[];
  weeklyOverview: {
    summary: string;
    keyHighlights: string[];
    importantDates: { date: string; event: string }[];
    weeklyMailingSummary: {
      mainTopics: string[];
      actionItems: string[];
      upcomingEvents: string[];
    };
  };
  factSheetSuggestions: {
    additions: string[];
    removals: string[];
  };
  updatedFactSheet: string;
}

export interface AdminStats {
  totalReminders: number;
  totalDocuments: number;
  lastScrapingStatus: 'running' | 'completed' | 'failed' | null;
  lastScrapingTime: Date | null;
}
