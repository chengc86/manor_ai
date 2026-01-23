'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { School, Calendar, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { YearGroupTabs } from '@/components/parent/year-group-tabs';
import { DayReminderGroup } from '@/components/parent/reminder-card';
import { WeeklyOverview } from '@/components/parent/weekly-overview';
import { GlassCardSkeleton } from '@/components/ui';
import { GlassTabs, GlassTabPanels, GlassTabPanel } from '@/components/ui/glass-tabs';
import { PageTransition, FadeIn } from '@/components/animations/page-transition';
import {
  getDisplayDate,
  formatDisplayDate,
  formatDateForDB,
  calculateWeekStartDate,
  formatWeekRange,
} from '@/lib/utils/dates';
import type { YearGroupDisplay, ReminderDisplay, WeeklyOverviewDisplay } from '@/types';

const AnimatedBackground = dynamic(
  () => import('@/components/three/animated-background').then((mod) => mod.AnimatedBackground),
  { ssr: false }
);

export default function ParentView() {
  const [yearGroups, setYearGroups] = useState<YearGroupDisplay[]>([]);
  const [activeYearGroup, setActiveYearGroup] = useState<string>('');
  const [reminders, setReminders] = useState<ReminderDisplay[]>([]);
  const [weeklyOverview, setWeeklyOverview] = useState<WeeklyOverviewDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('reminders');
  const [currentTime, setCurrentTime] = useState(new Date());

  const displayDate = useMemo(() => getDisplayDate(currentTime), [currentTime]);
  const weekStart = useMemo(() => calculateWeekStartDate(), []);
  const weekRange = useMemo(() => formatWeekRange(weekStart), [weekStart]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchYearGroups();
  }, []);

  useEffect(() => {
    if (activeYearGroup) {
      fetchReminders();
      fetchWeeklyOverview();
    }
  }, [activeYearGroup]);

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups');
      const data = await res.json();
      // Ensure data is an array
      const groups = Array.isArray(data) ? data : [];
      setYearGroups(groups);
      if (groups.length > 0) {
        setActiveYearGroup(groups[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
      setYearGroups([]);
    }
  };

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const weekStartDate = formatDateForDB(weekStart);
      const res = await fetch(
        `/api/reminders?yearGroupId=${activeYearGroup}&weekStartDate=${weekStartDate}`
      );
      const data = await res.json();
      // Ensure data is an array
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      setReminders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeeklyOverview = async () => {
    try {
      const weekStartDate = formatDateForDB(weekStart);
      const res = await fetch(
        `/api/weekly-overviews?yearGroupId=${activeYearGroup}&weekStartDate=${weekStartDate}`
      );
      const data = await res.json();
      setWeeklyOverview(data);
    } catch (error) {
      console.error('Failed to fetch weekly overview:', error);
    }
  };

  const remindersByDate = useMemo(() => {
    const grouped: Record<string, ReminderDisplay[]> = {};
    reminders.forEach((reminder) => {
      const date = reminder.reminderDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(reminder);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [reminders]);

  const todayStr = formatDateForDB(displayDate);

  return (
    <>
      <AnimatedBackground />

      <main className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <PageTransition>
            {/* Header */}
            <FadeIn className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30 border border-accent-primary/30">
                  <School className="w-8 h-8 text-accent-primary" />
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="typewriter-text">Manor AI Reminders</span>
              </h1>
              <p className="text-white/60 text-lg">
                Personalized daily reminders for your child
              </p>

              {/* Current display info */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/50">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Showing: {formatDisplayDate(displayDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </FadeIn>

            {/* Year Group Selector */}
            <FadeIn delay={0.2} className="mb-10">
              <YearGroupTabs
                yearGroups={yearGroups}
                activeYearGroup={activeYearGroup}
                onChange={setActiveYearGroup}
              />
            </FadeIn>

            {/* Content Tabs */}
            <FadeIn delay={0.3}>
              <div className="flex justify-center mb-8">
                <GlassTabs
                  tabs={[
                    { id: 'reminders', label: 'Daily Reminders', icon: <Calendar className="w-4 h-4" /> },
                    { id: 'overview', label: 'Weekly Overview', icon: <Clock className="w-4 h-4" /> },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </div>

              <GlassTabPanels>
                <GlassTabPanel tabId="reminders" activeTab={activeTab}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <GlassCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : remindersByDate.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass p-12 text-center"
                    >
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-white/30" />
                      <h3 className="text-xl font-semibold text-white/70 mb-2">
                        No Reminders Yet
                      </h3>
                      <p className="text-white/50">
                        Reminders will appear here once the weekly mailings are processed.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {remindersByDate.map(([date, dayReminders]) => (
                        <DayReminderGroup
                          key={date}
                          date={date}
                          reminders={dayReminders}
                          isToday={date === todayStr}
                        />
                      ))}
                    </div>
                  )}
                </GlassTabPanel>

                <GlassTabPanel tabId="overview" activeTab={activeTab}>
                  <WeeklyOverview overview={weeklyOverview} weekRange={weekRange} />
                </GlassTabPanel>
              </GlassTabPanels>
            </FadeIn>
          </PageTransition>
        </div>
      </main>
    </>
  );
}
