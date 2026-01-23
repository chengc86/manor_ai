'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { PriorityBadge, CategoryBadge } from '@/components/ui/priority-badge';
import { formatDisplayDate, getRelativeDay } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import type { ReminderDisplay } from '@/types';

interface ReminderCardProps {
  reminder: ReminderDisplay;
  index: number;
}

export function ReminderCard({ reminder, index }: ReminderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <GlassCard
        className={cn(
          'cursor-pointer transition-all duration-300',
          isExpanded && 'ring-1 ring-accent-primary/30'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        glow={reminder.priority === 'high' ? 'gold' : 'none'}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <PriorityBadge priority={reminder.priority} />
              {reminder.category && (
                <CategoryBadge category={reminder.category} />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 truncate">
              {reminder.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDisplayDate(reminder.reminderDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getRelativeDay(reminder.reminderDate)}
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-white/50" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && reminder.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="mt-4 pt-4 border-t border-white/10 text-white/80">
                {reminder.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

interface DayReminderGroupProps {
  date: string;
  reminders: ReminderDisplay[];
  isToday: boolean;
}

export function DayReminderGroup({
  date,
  reminders,
  isToday,
}: DayReminderGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 py-3 rounded-xl',
          'transition-all duration-300',
          isToday
            ? 'bg-gradient-to-r from-accent-primary/20 to-accent-emerald/20 border border-accent-primary/30'
            : 'bg-white/5 border border-white/10 hover:bg-white/10'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isToday
                ? 'bg-accent-primary animate-pulse'
                : 'bg-white/30'
            )}
          />
          <span className="font-semibold text-lg">
            {formatDisplayDate(date)}
          </span>
          {isToday && (
            <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary text-xs rounded-full font-medium">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">
            {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-white/50" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden pl-4 border-l-2 border-white/10"
          >
            {reminders.map((reminder, index) => (
              <ReminderCard key={reminder.id} reminder={reminder} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
