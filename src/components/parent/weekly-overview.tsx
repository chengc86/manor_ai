'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  Star,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Bell,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { GlassCard } from '@/components/ui';
import type { WeeklyOverviewDisplay } from '@/types';

interface WeeklyOverviewProps {
  overview: WeeklyOverviewDisplay | null;
  weekRange: string;
}

export function WeeklyOverview({ overview, weekRange }: WeeklyOverviewProps) {
  if (!overview) {
    return (
      <GlassCard className="text-center py-12">
        <div className="text-white/50">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No weekly overview available yet.</p>
          <p className="text-sm mt-2">
            The overview will appear after the LLM processes the weekly mailings.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <GlassCard glow="green">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-emerald/30">
            <TrendingUp className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold gradient-text mb-2">
              Week of {weekRange}
            </h3>
            <p className="text-white/80 leading-relaxed">{overview.summary}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Highlights */}
        {overview.keyHighlights && overview.keyHighlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <h4 className="font-semibold text-lg">Key Highlights</h4>
              </div>
              <ul className="space-y-3">
                {overview.keyHighlights.map((highlight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                    <span className="text-white/80">{highlight}</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        )}

        {/* Important Dates */}
        {overview.importantDates && overview.importantDates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent-gold/20">
                  <CalendarDays className="w-5 h-5 text-accent-gold" />
                </div>
                <h4 className="font-semibold text-lg">Important Dates</h4>
              </div>
              <ul className="space-y-3">
                {overview.importantDates.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                  >
                    <span className="text-xs font-mono text-accent-gold bg-accent-gold/20 px-2 py-1 rounded">
                      {item.date}
                    </span>
                    <span className="text-white/80">{item.event}</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Weekly Mailing Summary */}
      {overview.weeklyMailingSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent-emerald/20">
                <Bell className="w-5 h-5 text-accent-emerald" />
              </div>
              <h4 className="font-semibold text-lg">Weekly Mailing Summary</h4>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Topics */}
              {overview.weeklyMailingSummary.mainTopics.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                    Main Topics
                  </h5>
                  <ul className="space-y-2">
                    {overview.weeklyMailingSummary.mainTopics.map((topic, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-white/80"
                      >
                        <Lightbulb className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {overview.weeklyMailingSummary.actionItems.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                    Action Items
                  </h5>
                  <ul className="space-y-2">
                    {overview.weeklyMailingSummary.actionItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-white/80"
                      >
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
                  <h5 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                    Coming Up
                  </h5>
                  <ul className="space-y-2">
                    {overview.weeklyMailingSummary.upcomingEvents.map((event, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-white/80"
                      >
                        <CalendarDays className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                        <span>{event}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Source Documents (PDFs) */}
      {overview.pdfDocuments && overview.pdfDocuments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-semibold text-lg">Source Documents</h4>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Click to view the original weekly mailings used to generate this summary.
            </p>
            <div className="flex flex-wrap gap-3">
              {overview.pdfDocuments.map((doc, index) => (
                <motion.a
                  key={doc.id}
                  href={doc.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-accent-primary/50 transition-all group"
                >
                  <FileText className="w-4 h-4 text-accent-primary" />
                  <span className="text-sm text-white/80 group-hover:text-white">
                    {doc.filename}
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-accent-primary transition-colors" />
                </motion.a>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
