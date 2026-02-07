'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Sparkles,
  Loader2,
  ChevronDown,
  Calendar,
  CheckCircle2,
  Bell,
  Star,
  BookOpen,
  FileText,
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/page-transition';
import { toast } from 'sonner';
import type { YearGroupDisplay, LLMResponse } from '@/types';

interface StoredData {
  reminders: LLMResponse['dailyReminders'];
  overview: {
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
  } | null;
}

function calculateWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  let targetDate: Date;
  // Friday (5), Saturday (6), Sunday (0): use next Monday
  if (day === 5 || day === 6 || day === 0) {
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilMonday);
  } else {
    // Mon-Thu: get this week's Monday
    const diff = 1 - day;
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
  }
  // Format as YYYY-MM-DD using local timezone (not UTC) to match server behavior
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const date = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export default function YearGroupsPage() {
  const [yearGroups, setYearGroups] = useState<YearGroupDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [llmResponses, setLlmResponses] = useState<Record<string, LLMResponse>>({});
  const [storedData, setStoredData] = useState<Record<string, StoredData>>({});

  useEffect(() => {
    fetchYearGroups();
  }, []);

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups', { cache: 'no-store' });
      const data = await res.json();
      setYearGroups(data);

      // Load existing reminders and overviews from DB for each year group
      const weekStartDate = calculateWeekStartDate();
      for (const yg of data) {
        loadStoredData(yg.id, weekStartDate);
      }
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
      toast.error('Failed to load year groups');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredData = async (yearGroupId: string, weekStartDate: string) => {
    try {
      const [remindersRes, overviewRes] = await Promise.all([
        fetch(`/api/reminders?yearGroupId=${yearGroupId}&weekStartDate=${weekStartDate}`, { cache: 'no-store' }),
        fetch(`/api/weekly-overviews?yearGroupId=${yearGroupId}&weekStartDate=${weekStartDate}`, { cache: 'no-store' }),
      ]);

      const reminders = await remindersRes.json();
      const overview = await overviewRes.json();

      if ((Array.isArray(reminders) && reminders.length > 0) || overview) {
        setStoredData((prev) => ({
          ...prev,
          [yearGroupId]: {
            reminders: Array.isArray(reminders)
              ? reminders.map((r: Record<string, string>) => ({
                  date: r.reminderDate,
                  title: r.title,
                  description: r.description || '',
                  priority: r.priority as 'high' | 'medium' | 'low',
                  category: r.category || '',
                }))
              : [],
            overview,
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to load stored data for ${yearGroupId}:`, error);
    }
  };

  const generateReminders = async (yearGroupId: string, yearGroupName: string) => {
    setGeneratingId(yearGroupId);
    const weekStartDate = calculateWeekStartDate();
    try {
      const res = await fetch('/api/generate-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearGroupId, weekStartDate }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Generated reminders for ${yearGroupName}`);
        setLlmResponses((prev) => ({
          ...prev,
          [yearGroupId]: data.llmResponse,
        }));
        // Refresh stored data using the same weekStartDate sent to server
        loadStoredData(yearGroupId, weekStartDate);
        setExpandedId(yearGroupId);
      } else {
        toast.error(data.error || 'Generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate reminders');
    } finally {
      setGeneratingId(null);
    }
  };

  // Get the display data for a year group - prefer fresh LLM response, fallback to stored DB data
  const getDisplayData = (yearGroupId: string) => {
    const fresh = llmResponses[yearGroupId];
    if (fresh) return { source: 'llm' as const, data: fresh };

    const stored = storedData[yearGroupId];
    if (stored && (stored.reminders.length > 0 || stored.overview)) {
      // Reconstruct an LLMResponse-like object from stored data
      return {
        source: 'db' as const,
        data: {
          dailyReminders: stored.reminders,
          weeklyOverview: {
            summary: stored.overview?.summary || '',
            keyHighlights: stored.overview?.keyHighlights || [],
            importantDates: stored.overview?.importantDates || [],
            weeklyMailingSummary: stored.overview?.weeklyMailingSummary || {
              mainTopics: [],
              actionItems: [],
              upcomingEvents: [],
            },
          },
          factSheetSuggestions: stored.overview?.factSheetSuggestions || {
            additions: [],
            removals: [],
          },
          updatedFactSheet: '',
        } as LLMResponse,
      };
    }

    return null;
  };

  const hasData = (yearGroupId: string) => !!getDisplayData(yearGroupId);

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Year Groups</h1>
            <p className="text-white/60">
              Manage year groups and view generated reminders
            </p>
          </div>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      ) : yearGroups.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Year Groups Found</h3>
          <p className="text-white/60 mb-4">
            The database may not be connected or seeded properly.
          </p>
          <GlassButton
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </GlassButton>
        </GlassCard>
      ) : (
        <StaggerContainer className="space-y-4">
          {yearGroups.map((yg) => {
            const displayInfo = getDisplayData(yg.id);
            const r = displayInfo?.data;

            return (
              <StaggerItem key={yg.id}>
                <GlassCard className="overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30">
                        <Users className="w-6 h-6 text-accent-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{yg.name}</h3>
                        <p className="text-sm text-white/60">
                          {r ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                              {r.dailyReminders.length} reminders generated
                              {displayInfo?.source === 'db' && (
                                <span className="text-xs text-white/40">(from database)</span>
                              )}
                            </span>
                          ) : (
                            'No reminders generated yet'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => generateReminders(yg.id, yg.name)}
                        isLoading={generatingId === yg.id}
                        leftIcon={<Sparkles className="w-4 h-4" />}
                      >
                        Generate Reminders
                      </GlassButton>
                      {hasData(yg.id) && (
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === yg.id ? null : yg.id)
                          }
                          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <motion.div
                            animate={{ rotate: expandedId === yg.id ? 180 : 0 }}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* LLM Response Viewer */}
                  <AnimatePresence>
                    {expandedId === yg.id && r && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                          {/* Weekly Overview */}
                          {r.weeklyOverview.summary && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-accent-gold" />
                                Weekly Overview
                              </h4>
                              <p className="text-sm text-white/70 mb-4">{r.weeklyOverview.summary}</p>

                              {r.weeklyOverview.keyHighlights.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-medium text-white/50 mb-2">Key Highlights</p>
                                  <ul className="space-y-1">
                                    {r.weeklyOverview.keyHighlights.map((h, i) => (
                                      <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                        <span className="text-accent-emerald mt-0.5">•</span>
                                        {h}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {r.weeklyOverview.importantDates.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-medium text-white/50 mb-2">Important Dates</p>
                                  <div className="space-y-1">
                                    {r.weeklyOverview.importantDates.map((d, i) => (
                                      <div key={i} className="text-sm flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-accent-gold" />
                                        <span className="text-white/50">{d.date}</span>
                                        <span className="text-white/70">{d.event}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {r.weeklyOverview.weeklyMailingSummary && (
                                r.weeklyOverview.weeklyMailingSummary.mainTopics.length > 0 ||
                                r.weeklyOverview.weeklyMailingSummary.actionItems.length > 0 ||
                                r.weeklyOverview.weeklyMailingSummary.upcomingEvents.length > 0
                              ) && (
                                <div className="p-4 rounded-xl bg-white/5">
                                  <p className="text-xs font-medium text-white/50 mb-3">Weekly Mailing Summary</p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {r.weeklyOverview.weeklyMailingSummary.mainTopics.length > 0 && (
                                      <div>
                                        <p className="text-xs text-accent-primary font-medium mb-1">Main Topics</p>
                                        {r.weeklyOverview.weeklyMailingSummary.mainTopics.map((t, i) => (
                                          <p key={i} className="text-white/60 text-xs">• {t}</p>
                                        ))}
                                      </div>
                                    )}
                                    {r.weeklyOverview.weeklyMailingSummary.actionItems.length > 0 && (
                                      <div>
                                        <p className="text-xs text-accent-emerald font-medium mb-1">Action Items</p>
                                        {r.weeklyOverview.weeklyMailingSummary.actionItems.map((a, i) => (
                                          <p key={i} className="text-white/60 text-xs">• {a}</p>
                                        ))}
                                      </div>
                                    )}
                                    {r.weeklyOverview.weeklyMailingSummary.upcomingEvents.length > 0 && (
                                      <div>
                                        <p className="text-xs text-accent-gold font-medium mb-1">Upcoming Events</p>
                                        {r.weeklyOverview.weeklyMailingSummary.upcomingEvents.map((e, i) => (
                                          <p key={i} className="text-white/60 text-xs">• {e}</p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Daily Reminders */}
                          {r.dailyReminders.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-accent-primary" />
                                Daily Reminders ({r.dailyReminders.length})
                              </h4>
                              <div className="space-y-2">
                                {r.dailyReminders.map((reminder, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-xl bg-white/5 flex items-start gap-3"
                                  >
                                    <span
                                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                        reminder.priority === 'high'
                                          ? 'bg-red-400'
                                          : reminder.priority === 'medium'
                                          ? 'bg-amber-400'
                                          : 'bg-green-400'
                                      }`}
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white/90">{reminder.title}</span>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            reminder.priority === 'high'
                                              ? 'bg-red-500/20 text-red-300'
                                              : reminder.priority === 'medium'
                                              ? 'bg-amber-500/20 text-amber-300'
                                              : 'bg-green-500/20 text-green-300'
                                          }`}
                                        >
                                          {reminder.priority}
                                        </span>
                                      </div>
                                      <p className="text-sm text-white/60">{reminder.description}</p>
                                      <p className="text-xs text-white/40 mt-1">
                                        {reminder.date} • {reminder.category}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fact Sheet Suggestions */}
                          {(r.factSheetSuggestions.additions.length > 0 || r.factSheetSuggestions.removals.length > 0) && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-accent-gold" />
                                Fact Sheet Suggestions
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                {r.factSheetSuggestions.additions.length > 0 && (
                                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <p className="text-sm font-medium text-green-400 mb-2">Additions</p>
                                    <ul className="space-y-1">
                                      {r.factSheetSuggestions.additions.map((a, i) => (
                                        <li key={i} className="text-sm text-white/70">+ {a}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {r.factSheetSuggestions.removals.length > 0 && (
                                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm font-medium text-red-400 mb-2">Removals</p>
                                    <ul className="space-y-1">
                                      {r.factSheetSuggestions.removals.map((rm, i) => (
                                        <li key={i} className="text-sm text-white/70">- {rm}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Updated Fact Sheet */}
                          {r.updatedFactSheet && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-white/60" />
                                Updated Fact Sheet
                              </h4>
                              <pre className="text-sm text-white/50 bg-black/30 p-4 rounded-xl whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {r.updatedFactSheet}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
