'use client';

import { useState, useEffect, useMemo } from 'react';
import { School, Calendar, Clock } from 'lucide-react';
import { YearGroupTabs } from '@/components/parent/year-group-tabs';
import { DayReminderGroup } from '@/components/parent/reminder-card';
import { WeeklyOverview } from '@/components/parent/weekly-overview';
import {
  getDisplayDate,
  formatDisplayDate,
  formatDateForDB,
  calculateWeekStartDate,
  formatWeekRange,
} from '@/lib/utils/dates';
import type { YearGroupDisplay, ReminderDisplay, WeeklyOverviewDisplay } from '@/types';

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
    <main className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
              <School className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Manor AI Reminders
          </h1>
          <p className="text-gray-400 text-lg">
            Personalized daily reminders for your child
          </p>

          {/* Current display info */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
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
        </div>

        {/* Year Group Selector */}
        <div className="mb-10">
          <YearGroupTabs
            yearGroups={yearGroups}
            activeYearGroup={activeYearGroup}
            onChange={setActiveYearGroup}
          />
        </div>

        {/* Content Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-900 border border-gray-800">
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reminders'
                  ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Daily Reminders
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Weekly Overview
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'reminders' && (
          <>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-6">
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 w-3/4 bg-gray-800 rounded" />
                      <div className="h-4 w-full bg-gray-800 rounded" />
                      <div className="h-4 w-5/6 bg-gray-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : remindersByDate.length === 0 ? (
              <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No Reminders Yet
                </h3>
                <p className="text-gray-500">
                  Reminders will appear here once the weekly mailings are processed.
                </p>
              </div>
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
          </>
        )}

        {activeTab === 'overview' && (
          <WeeklyOverview overview={weeklyOverview} weekRange={weekRange} />
        )}
      </div>
    </main>
  );
}
