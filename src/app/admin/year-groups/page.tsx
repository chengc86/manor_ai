'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Loader2, ChevronDown, Calendar, CheckCircle2 } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/page-transition';
import { toast } from 'sonner';
import type { YearGroupDisplay, LLMResponse } from '@/types';

export default function YearGroupsPage() {
  const [yearGroups, setYearGroups] = useState<YearGroupDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [llmResponses, setLlmResponses] = useState<Record<string, LLMResponse>>({});

  useEffect(() => {
    fetchYearGroups();
  }, []);

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups');
      const data = await res.json();
      setYearGroups(data);
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
      toast.error('Failed to load year groups');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReminders = async (yearGroupId: string, yearGroupName: string) => {
    setGeneratingId(yearGroupId);
    try {
      const res = await fetch('/api/generate-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearGroupId }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Generated reminders for ${yearGroupName}`);
        setLlmResponses((prev) => ({
          ...prev,
          [yearGroupId]: data.llmResponse,
        }));
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

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Year Groups</h1>
            <p className="text-white/60">
              Manage year groups and generate reminders
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
          {yearGroups.map((yg) => (
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
                        Order: {yg.displayOrder}
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
                    {llmResponses[yg.id] && (
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
                  {expandedId === yg.id && llmResponses[yg.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                        {/* Daily Reminders */}
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent-primary" />
                            Daily Reminders ({llmResponses[yg.id].dailyReminders.length})
                          </h4>
                          <div className="space-y-2">
                            {llmResponses[yg.id].dailyReminders.map((reminder, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-white/5 flex items-start gap-3"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{reminder.title}</span>
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

                        {/* Weekly Overview */}
                        <div>
                          <h4 className="font-semibold mb-4">Weekly Overview</h4>
                          <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-white/80 mb-4">
                              {llmResponses[yg.id].weeklyOverview.summary}
                            </p>
                            {llmResponses[yg.id].weeklyOverview.keyHighlights.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-white/60 mb-2">Key Highlights:</p>
                                <ul className="space-y-1">
                                  {llmResponses[yg.id].weeklyOverview.keyHighlights.map((h, i) => (
                                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                      <span className="text-accent-primary">•</span>
                                      {h}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Fact Sheet Suggestions */}
                        <div>
                          <h4 className="font-semibold mb-4">Fact Sheet Suggestions</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                              <p className="text-sm font-medium text-green-400 mb-2">Additions</p>
                              <ul className="space-y-1">
                                {llmResponses[yg.id].factSheetSuggestions.additions.map((a, i) => (
                                  <li key={i} className="text-sm text-white/70">+ {a}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                              <p className="text-sm font-medium text-red-400 mb-2">Removals</p>
                              <ul className="space-y-1">
                                {llmResponses[yg.id].factSheetSuggestions.removals.map((r, i) => (
                                  <li key={i} className="text-sm text-white/70">- {r}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
