'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { YearGroupDisplay } from '@/types';

interface StoredReminder {
  date: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface StoredOverview {
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
}

interface YearGroupData {
  reminders: StoredReminder[];
  overview: StoredOverview | null;
}

function calculateWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  let targetDate: Date;
  if (day === 5 || day === 6 || day === 0) {
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilMonday);
  } else {
    const diff = 1 - day;
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
  }
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const date = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/**
 * Get the display date for the upcoming reminder card.
 * Before 10am: show today's reminders
 * After 10am: show tomorrow's reminders
 * Friday after 10am / weekends: show Monday's reminders
 */
function getDisplayDate(): { date: string; label: string } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const isBeforeTen = hour < 10;

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Weekend: always show Monday
  if (day === 0 || day === 6) {
    const daysUntilMonday = day === 0 ? 1 : 2;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);
    return { date: formatDate(monday), label: 'Monday' };
  }

  // Before 10am: show today
  if (isBeforeTen) {
    return { date: formatDate(now), label: 'Today' };
  }

  // Friday after 10am: show Monday
  if (day === 5) {
    const monday = new Date(now);
    monday.setDate(now.getDate() + 3);
    return { date: formatDate(monday), label: 'Monday' };
  }

  // Mon-Thu after 10am: show tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return { date: formatDate(tomorrow), label: 'Tomorrow' };
}

const priorityColors = {
  high: { dot: 'bg-red-400', badge: 'bg-red-500/30 text-red-200', border: 'border-red-500/20' },
  medium: { dot: 'bg-amber-400', badge: 'bg-amber-500/30 text-amber-200', border: 'border-amber-500/20' },
  low: { dot: 'bg-emerald-400', badge: 'bg-emerald-500/30 text-emerald-200', border: 'border-emerald-500/20' },
};

export default function YearGroupsPage() {
  const [yearGroups, setYearGroups] = useState<YearGroupDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, YearGroupData>>({});

  const displayDate = useMemo(() => getDisplayDate(), []);

  useEffect(() => {
    fetchYearGroups();
  }, []);

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups', { cache: 'no-store' });
      const groups = await res.json();
      setYearGroups(groups);

      const weekStartDate = calculateWeekStartDate();
      for (const yg of groups) {
        loadData(yg.id, weekStartDate);
      }
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
      toast.error('Failed to load year groups');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async (yearGroupId: string, weekStartDate: string) => {
    try {
      const [remindersRes, overviewRes] = await Promise.all([
        fetch(`/api/reminders?yearGroupId=${yearGroupId}&weekStartDate=${weekStartDate}`, { cache: 'no-store' }),
        fetch(`/api/weekly-overviews?yearGroupId=${yearGroupId}&weekStartDate=${weekStartDate}`, { cache: 'no-store' }),
      ]);

      const remindersJson = await remindersRes.json();
      const overviewJson = await overviewRes.json();

      const reminders: StoredReminder[] = Array.isArray(remindersJson)
        ? remindersJson.map((r: Record<string, string>) => ({
            date: r.reminderDate,
            title: r.title,
            description: r.description || '',
            priority: r.priority as 'high' | 'medium' | 'low',
            category: r.category || '',
          }))
        : [];

      const overview: StoredOverview | null =
        overviewJson && !overviewJson.error ? overviewJson : null;

      setData((prev) => ({
        ...prev,
        [yearGroupId]: { reminders, overview },
      }));
    } catch (error) {
      console.error(`Failed to load data for ${yearGroupId}:`, error);
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
      const result = await res.json();

      if (result.success) {
        toast.success(`Generated reminders for ${yearGroupName}`);
        await loadData(yearGroupId, weekStartDate);
        setExpandedId(yearGroupId);
      } else {
        toast.error(result.error || 'Generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate reminders');
    } finally {
      setGeneratingId(null);
    }
  };

  // Collect upcoming reminders for the display date across all year groups
  const upcomingReminders = useMemo(() => {
    const items: { yearGroupName: string; reminder: StoredReminder }[] = [];
    for (const yg of yearGroups) {
      const d = data[yg.id];
      if (!d) continue;
      for (const r of d.reminders) {
        if (r.date === displayDate.date) {
          items.push({ yearGroupName: yg.name, reminder: r });
        }
      }
    }
    // Sort: high first, then medium, then low
    const order = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => order[a.reminder.priority] - order[b.reminder.priority]);
    return items;
  }, [yearGroups, data, displayDate.date]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Year Groups</h1>
        <p className="text-gray-400 text-sm">
          Manage year groups and view generated reminders
        </p>
      </div>

      {/* Upcoming Reminders Card */}
      <div className="rounded-xl bg-gray-900 border border-gray-700/50 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {displayDate.label}&apos;s Reminders
            </h2>
            <p className="text-xs text-gray-500">{displayDate.date}</p>
          </div>
        </div>

        {upcomingReminders.length === 0 ? (
          <p className="text-gray-500 text-sm py-3">
            No reminders for this day yet. Generate reminders below.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map((item, idx) => {
              const colors = priorityColors[item.reminder.priority];
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg bg-gray-800/80 border ${colors.border}`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-white text-sm">{item.reminder.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge}`}>
                        {item.reminder.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{item.reminder.description}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {item.yearGroupName} &middot; {item.reminder.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Year Groups */}
      {yearGroups.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-700/50 text-center py-12 px-6">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Year Groups Found</h3>
          <p className="text-gray-500 text-sm mb-4">
            The database may not be connected or seeded properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {yearGroups.map((yg) => {
            const d = data[yg.id];
            const reminders = d?.reminders || [];
            const overview = d?.overview;
            const hasContent = reminders.length > 0 || overview !== null;
            const isExpanded = expandedId === yg.id;

            return (
              <div key={yg.id} className="rounded-xl bg-gray-900 border border-gray-700/50 overflow-hidden">
                {/* Year group header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/15">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{yg.name}</h3>
                      <p className="text-xs text-gray-500">
                        {hasContent ? (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {reminders.length} reminders
                          </span>
                        ) : (
                          'No reminders generated yet'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateReminders(yg.id, yg.name)}
                      disabled={generatingId === yg.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                    >
                      {generatingId === yg.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      Generate
                    </button>
                    {hasContent && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : yg.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && hasContent && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-5">
                    {/* Weekly Overview */}
                    {overview?.summary && (
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" />
                          Weekly Overview
                        </h4>
                        <p className="text-gray-300 text-sm mb-3">{overview.summary}</p>

                        {overview.keyHighlights && overview.keyHighlights.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1.5">Key Highlights</p>
                            <ul className="space-y-1">
                              {overview.keyHighlights.map((h, i) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">&bull;</span>
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {overview.importantDates && overview.importantDates.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1.5">Important Dates</p>
                            <div className="space-y-1">
                              {overview.importantDates.map((d, i) => (
                                <div key={i} className="text-sm flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-amber-400" />
                                  <span className="text-gray-500">{d.date}</span>
                                  <span className="text-gray-300">{d.event}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {overview.weeklyMailingSummary && (
                          overview.weeklyMailingSummary.mainTopics.length > 0 ||
                          overview.weeklyMailingSummary.actionItems.length > 0 ||
                          overview.weeklyMailingSummary.upcomingEvents.length > 0
                        ) && (
                          <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700/30">
                            <p className="text-xs font-medium text-gray-500 mb-2">Weekly Mailing Summary</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              {overview.weeklyMailingSummary.mainTopics.length > 0 && (
                                <div>
                                  <p className="text-xs text-emerald-400 font-medium mb-1">Main Topics</p>
                                  {overview.weeklyMailingSummary.mainTopics.map((t, i) => (
                                    <p key={i} className="text-gray-400 text-xs">&bull; {t}</p>
                                  ))}
                                </div>
                              )}
                              {overview.weeklyMailingSummary.actionItems.length > 0 && (
                                <div>
                                  <p className="text-xs text-cyan-400 font-medium mb-1">Action Items</p>
                                  {overview.weeklyMailingSummary.actionItems.map((a, i) => (
                                    <p key={i} className="text-gray-400 text-xs">&bull; {a}</p>
                                  ))}
                                </div>
                              )}
                              {overview.weeklyMailingSummary.upcomingEvents.length > 0 && (
                                <div>
                                  <p className="text-xs text-amber-400 font-medium mb-1">Upcoming Events</p>
                                  {overview.weeklyMailingSummary.upcomingEvents.map((e, i) => (
                                    <p key={i} className="text-gray-400 text-xs">&bull; {e}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Daily Reminders */}
                    {reminders.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-400" />
                          Daily Reminders ({reminders.length})
                        </h4>
                        <div className="space-y-1.5">
                          {reminders.map((reminder, idx) => {
                            const colors = priorityColors[reminder.priority];
                            return (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-gray-800/60 flex items-start gap-2.5"
                              >
                                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-medium text-white text-sm">{reminder.title}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge}`}>
                                      {reminder.priority}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-sm">{reminder.description}</p>
                                  <p className="text-gray-600 text-xs mt-0.5">
                                    {reminder.date} &middot; {reminder.category}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fact Sheet Suggestions */}
                    {overview?.factSheetSuggestions && (
                      overview.factSheetSuggestions.additions.length > 0 || overview.factSheetSuggestions.removals.length > 0
                    ) && (
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          Fact Sheet Suggestions
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {overview.factSheetSuggestions.additions.length > 0 && (
                            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/30">
                              <p className="text-sm font-medium text-emerald-400 mb-1.5">Additions</p>
                              <ul className="space-y-0.5">
                                {overview.factSheetSuggestions.additions.map((a, i) => (
                                  <li key={i} className="text-sm text-gray-300">+ {a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {overview.factSheetSuggestions.removals.length > 0 && (
                            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/30">
                              <p className="text-sm font-medium text-red-400 mb-1.5">Removals</p>
                              <ul className="space-y-0.5">
                                {overview.factSheetSuggestions.removals.map((rm, i) => (
                                  <li key={i} className="text-sm text-gray-300">- {rm}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
