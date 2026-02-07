'use client';

import {
  CalendarDays,
  Star,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Bell,
} from 'lucide-react';
import type { WeeklyOverviewDisplay } from '@/types';

interface WeeklyOverviewProps {
  overview: WeeklyOverviewDisplay | null;
  weekRange: string;
}

export function WeeklyOverview({ overview, weekRange }: WeeklyOverviewProps) {
  if (!overview) {
    return (
      <div className="rounded-xl bg-gray-900 border border-gray-800 text-center py-12 px-6">
        <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-700" />
        <p className="text-gray-400">No weekly overview available yet.</p>
        <p className="text-sm mt-2 text-gray-500">
          The overview will appear after the LLM processes the weekly mailings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/15">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Week of {weekRange}
            </h3>
            <p className="text-gray-300 leading-relaxed">{overview.summary}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Highlights */}
        {overview.keyHighlights && overview.keyHighlights.length > 0 && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-lg text-white">Key Highlights</h4>
            </div>
            <ul className="space-y-3">
              {overview.keyHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                  <span className="text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Important Dates */}
        {overview.importantDates && overview.importantDates.length > 0 && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <CalendarDays className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-semibold text-lg text-white">Important Dates</h4>
            </div>
            <ul className="space-y-3">
              {overview.importantDates.map((item, index) => (
                <li key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/60">
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                    {item.date}
                  </span>
                  <span className="text-gray-300">{item.event}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Weekly Mailing Summary */}
      {overview.weeklyMailingSummary && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-lg text-white">Weekly Mailing Summary</h4>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Topics */}
            {overview.weeklyMailingSummary.mainTopics.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Main Topics
                </h5>
                <ul className="space-y-2">
                  {overview.weeklyMailingSummary.mainTopics.map((topic, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {overview.weeklyMailingSummary.actionItems.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Action Items
                </h5>
                <ul className="space-y-2">
                  {overview.weeklyMailingSummary.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upcoming Events */}
            {overview.weeklyMailingSummary.upcomingEvents.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Coming Up
                </h5>
                <ul className="space-y-2">
                  {overview.weeklyMailingSummary.upcomingEvents.map((event, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <CalendarDays className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
