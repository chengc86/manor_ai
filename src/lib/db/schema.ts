import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
  json,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['parent', 'admin']);
export const priorityEnum = pgEnum('priority', ['high', 'medium', 'low']);
export const documentTypeEnum = pgEnum('document_type', ['weekly_mailing', 'fact_sheet']);
export const scrapingStatusEnum = pgEnum('scraping_status', ['running', 'completed', 'failed']);

// 1. Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('parent'),
  yearGroupId: uuid('year_group_id').references(() => yearGroups.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Year Groups table
export const yearGroups = pgTable('year_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Daily Reminders table
export const dailyReminders = pgTable('daily_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  yearGroupId: uuid('year_group_id').references(() => yearGroups.id).notNull(),
  reminderDate: date('reminder_date').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: priorityEnum('priority').notNull().default('medium'),
  category: varchar('category', { length: 100 }),
  weekStartDate: date('week_start_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Weekly Overviews table
export const weeklyOverviews = pgTable('weekly_overviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  yearGroupId: uuid('year_group_id').references(() => yearGroups.id).notNull(),
  weekStartDate: date('week_start_date').notNull(),
  summary: text('summary'),
  keyHighlights: json('key_highlights').$type<string[]>(),
  importantDates: json('important_dates').$type<{ date: string; event: string }[]>(),
  weeklyMailingSummary: json('weekly_mailing_summary').$type<{
    mainTopics: string[];
    actionItems: string[];
    upcomingEvents: string[];
  }>(),
  factSheetSuggestions: json('fact_sheet_suggestions').$type<{
    additions: string[];
    removals: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Documents table
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: documentTypeEnum('type').notNull(),
  yearGroupId: uuid('year_group_id').references(() => yearGroups.id),
  weekStartDate: date('week_start_date'),
  filename: varchar('filename', { length: 255 }).notNull(),
  s3Key: varchar('s3_key', { length: 500 }).notNull(),
  s3Url: varchar('s3_url', { length: 1000 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size'),
  timetableJson: text('timetable_json'),
  isActive: boolean('is_active').notNull().default(true),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Scraping Logs table
export const scrapingLogs = pgTable('scraping_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  status: scrapingStatusEnum('status').notNull().default('running'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  documentsFound: integer('documents_found').default(0),
  documentsProcessed: integer('documents_processed').default(0),
  errorMessage: text('error_message'),
  logDetails: json('log_details').$type<{ timestamp: string; message: string; step: number }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Agent Settings table
export const agentSettings = pgTable('agent_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Scraping Schedules table
export const scrapingSchedules = pgTable('scraping_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(),
  timeOfDay: varchar('time_of_day', { length: 10 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type YearGroup = typeof yearGroups.$inferSelect;
export type NewYearGroup = typeof yearGroups.$inferInsert;
export type DailyReminder = typeof dailyReminders.$inferSelect;
export type NewDailyReminder = typeof dailyReminders.$inferInsert;
export type WeeklyOverview = typeof weeklyOverviews.$inferSelect;
export type NewWeeklyOverview = typeof weeklyOverviews.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type ScrapingLog = typeof scrapingLogs.$inferSelect;
export type NewScrapingLog = typeof scrapingLogs.$inferInsert;
export type AgentSetting = typeof agentSettings.$inferSelect;
export type NewAgentSetting = typeof agentSettings.$inferInsert;
export type ScrapingSchedule = typeof scrapingSchedules.$inferSelect;
export type NewScrapingSchedule = typeof scrapingSchedules.$inferInsert;
