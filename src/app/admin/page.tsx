'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  FileText,
  Users,
  Clock,
  Play,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  BookOpen,
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/page-transition';
import { toast } from 'sonner';
import type { LLMResponse } from '@/types';

interface Stats {
  totalReminders: number;
  totalDocuments: number;
  totalYearGroups: number;
  lastScrapingStatus: 'running' | 'completed' | 'failed' | null;
  lastScrapingTime: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalReminders: 0,
    totalDocuments: 0,
    totalYearGroups: 0,
    lastScrapingStatus: null,
    lastScrapingTime: null,
  });
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [yearGroups, setYearGroups] = useState<{ id: string; name: string }[]>([]);
  const [llmResults, setLlmResults] = useState<{ yearGroup: string; response: LLMResponse }[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchYearGroups();
  }, []);

  const fetchStats = async () => {
    try {
      const [docsRes, groupsRes, logsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/year-groups'),
        fetch('/api/scraping/logs?limit=1'),
      ]);

      const docs = await docsRes.json();
      const groups = await groupsRes.json();
      const logs = await logsRes.json();

      setStats({
        totalReminders: 0,
        totalDocuments: Array.isArray(docs) ? docs.length : 0,
        totalYearGroups: Array.isArray(groups) ? groups.length : 0,
        lastScrapingStatus: logs[0]?.status || null,
        lastScrapingTime: logs[0]?.startedAt || null,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups');
      const data = await res.json();
      setYearGroups(data);
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
    }
  };

  const triggerScraping = async () => {
    setIsScrapingLoading(true);
    try {
      const res = await fetch('/api/scraping/trigger', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchStats();
      } else {
        toast.error(data.error || 'Scraping failed');
      }
    } catch (error) {
      toast.error('Failed to trigger scraping');
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const generateAllReminders = async () => {
    setIsGenerating(true);
    setLlmResults([]);
    try {
      if (yearGroups.length === 0) {
        toast.error('No year groups found. Please check the database connection.');
        return;
      }

      toast.info(`Generating reminders for ${yearGroups.length} year groups...`);
      const results: { yearGroup: string; response: LLMResponse }[] = [];

      for (const yg of yearGroups) {
        const res = await fetch('/api/generate-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yearGroupId: yg.id }),
        });
        const data = await res.json();

        if (data.success && data.llmResponse) {
          toast.success(`Generated reminders for ${yg.name}`);
          results.push({ yearGroup: yg.name, response: data.llmResponse });
        } else {
          toast.error(`Failed for ${yg.name}: ${data.error}`);
        }
      }

      setLlmResults(results);
      if (results.length > 0) {
        setExpandedResult(results[0].yearGroup);
      }
    } catch (error) {
      console.error('Generate reminders error:', error);
      toast.error('Failed to generate reminders');
    } finally {
      setIsGenerating(false);
    }
  };

  const statCards = [
    {
      label: 'Year Groups',
      value: stats.totalYearGroups,
      icon: Users,
      color: 'from-accent-primary/30 to-blue-500/30',
      iconColor: 'text-accent-primary',
    },
    {
      label: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'from-accent-emerald/30 to-violet-500/30',
      iconColor: 'text-accent-emerald',
    },
    {
      label: 'Last Scraping',
      value: stats.lastScrapingStatus
        ? stats.lastScrapingStatus.charAt(0).toUpperCase() + stats.lastScrapingStatus.slice(1)
        : 'Never',
      icon:
        stats.lastScrapingStatus === 'completed'
          ? CheckCircle2
          : stats.lastScrapingStatus === 'failed'
          ? AlertCircle
          : Clock,
      color:
        stats.lastScrapingStatus === 'completed'
          ? 'from-green-500/30 to-emerald-500/30'
          : stats.lastScrapingStatus === 'failed'
          ? 'from-red-500/30 to-pink-500/30'
          : 'from-amber-500/30 to-orange-500/30',
      iconColor:
        stats.lastScrapingStatus === 'completed'
          ? 'text-green-400'
          : stats.lastScrapingStatus === 'failed'
          ? 'text-red-400'
          : 'text-amber-400',
    },
    {
      label: 'System Status',
      value: 'Online',
      icon: TrendingUp,
      color: 'from-accent-gold/30 to-rose-500/30',
      iconColor: 'text-accent-gold',
    },
  ];

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-white/60">
              Overview of your school mailing system
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StaggerItem key={stat.label}>
            <GlassCard className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div
                className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} blur-2xl opacity-30`}
              />
            </GlassCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Quick Actions */}
      <FadeIn delay={0.3}>
        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-accent-primary/10 to-accent-emerald/10 border border-accent-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/30 to-blue-500/30">
                  <Play className="w-6 h-6 text-accent-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Trigger Scraping</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Manually scrape the school website for new weekly mailings
                  </p>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={triggerScraping}
                    isLoading={isScrapingLoading}
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    Start Scraping
                  </GlassButton>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-accent-emerald/10 to-accent-gold/10 border border-accent-emerald/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent-emerald/30 to-pink-500/30">
                  <Bell className="w-6 h-6 text-accent-emerald" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Generate All Reminders</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Process mailings and generate reminders for all year groups
                  </p>
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={generateAllReminders}
                    isLoading={isGenerating}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Generate Reminders
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* LLM Response Results */}
      {llmResults.length > 0 && (
        <FadeIn delay={0.35}>
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" />
              LLM Response Results
            </h2>
            <div className="space-y-4">
              {llmResults.map((result) => {
                const isExpanded = expandedResult === result.yearGroup;
                const r = result.response;

                return (
                  <div key={result.yearGroup} className="rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setExpandedResult(isExpanded ? null : result.yearGroup)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30">
                          <Users className="w-4 h-4 text-accent-primary" />
                        </div>
                        <span className="font-semibold">{result.yearGroup}</span>
                        <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                          {r.dailyReminders.length} reminders
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-6">
                        {/* Weekly Overview */}
                        <div>
                          <h4 className="text-sm font-semibold text-accent-primary mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Weekly Overview
                          </h4>
                          <p className="text-sm text-white/70 mb-3">{r.weeklyOverview.summary}</p>

                          {r.weeklyOverview.keyHighlights.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-white/50 mb-1">Key Highlights</p>
                              <ul className="space-y-1">
                                {r.weeklyOverview.keyHighlights.map((h, i) => (
                                  <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-accent-emerald mt-1">•</span>
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {r.weeklyOverview.importantDates.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-white/50 mb-1">Important Dates</p>
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
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs font-medium text-white/50 mb-2">Mailing Summary</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-accent-primary mb-1">Main Topics</p>
                                  {r.weeklyOverview.weeklyMailingSummary.mainTopics.map((t, i) => (
                                    <p key={i} className="text-white/60 text-xs">• {t}</p>
                                  ))}
                                </div>
                                <div>
                                  <p className="text-xs text-accent-emerald mb-1">Action Items</p>
                                  {r.weeklyOverview.weeklyMailingSummary.actionItems.map((a, i) => (
                                    <p key={i} className="text-white/60 text-xs">• {a}</p>
                                  ))}
                                </div>
                                <div>
                                  <p className="text-xs text-accent-gold mb-1">Upcoming Events</p>
                                  {r.weeklyOverview.weeklyMailingSummary.upcomingEvents.map((e, i) => (
                                    <p key={i} className="text-white/60 text-xs">• {e}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Daily Reminders */}
                        <div>
                          <h4 className="text-sm font-semibold text-accent-emerald mb-2 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Daily Reminders
                          </h4>
                          <div className="space-y-2">
                            {r.dailyReminders.map((rem, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                              >
                                <span
                                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                    rem.priority === 'high'
                                      ? 'bg-red-400'
                                      : rem.priority === 'medium'
                                      ? 'bg-amber-400'
                                      : 'bg-green-400'
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs text-white/40">{rem.date}</span>
                                    <span className="text-xs text-white/30 bg-white/10 px-1.5 py-0.5 rounded">
                                      {rem.category}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-white/90">{rem.title}</p>
                                  <p className="text-xs text-white/50">{rem.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Fact Sheet Suggestions */}
                        <div>
                          <h4 className="text-sm font-semibold text-accent-gold mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Fact Sheet Suggestions
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {r.factSheetSuggestions.additions.length > 0 && (
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-xs font-medium text-green-400 mb-1">Additions</p>
                                {r.factSheetSuggestions.additions.map((a, i) => (
                                  <p key={i} className="text-xs text-white/60">+ {a}</p>
                                ))}
                              </div>
                            )}
                            {r.factSheetSuggestions.removals.length > 0 && (
                              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-xs font-medium text-red-400 mb-1">Removals</p>
                                {r.factSheetSuggestions.removals.map((rm, i) => (
                                  <p key={i} className="text-xs text-white/60">- {rm}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Updated Fact Sheet */}
                        {r.updatedFactSheet && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-2">Updated Fact Sheet</h4>
                            <pre className="text-xs text-white/50 bg-black/30 p-3 rounded-lg whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {r.updatedFactSheet}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </FadeIn>
      )}

      {/* Recent Activity */}
      <FadeIn delay={0.4}>
        <GlassCard>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-emerald" />
            System Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80">Database Connection</span>
              </div>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80">S3 Storage</span>
              </div>
              <span className="text-green-400 text-sm">Available</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-white/80">Scheduled Scraping</span>
              </div>
              <span className="text-amber-400 text-sm">Every Friday 9 AM</span>
            </div>
            {stats.lastScrapingTime && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">Last Scraping Run</span>
                </div>
                <span className="text-white/60 text-sm">
                  {new Date(stats.lastScrapingTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      </FadeIn>
    </PageTransition>
  );
}
