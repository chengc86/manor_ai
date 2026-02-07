'use client';

import { useState } from 'react';
import { ChevronDown, Clock, Calendar } from 'lucide-react';
import { PriorityBadge, CategoryBadge } from '@/components/ui/priority-badge';
import { formatDisplayDate, getRelativeDay } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import type { ReminderDisplay } from '@/types';

interface ReminderCardProps {
  reminder: ReminderDisplay;
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={cn(
        'rounded-xl bg-gray-900 border border-gray-800 p-5 cursor-pointer transition-colors hover:bg-gray-900/80',
        isExpanded && 'ring-1 ring-emerald-500/20'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
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
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </div>

      {isExpanded && reminder.description && (
        <p className="mt-4 pt-4 border-t border-gray-800 text-gray-300">
          {reminder.description}
        </p>
      )}
    </div>
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
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 py-3 rounded-xl transition-colors',
          isToday
            ? 'bg-emerald-500/15 border border-emerald-500/30'
            : 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isToday ? 'bg-emerald-400' : 'bg-gray-600'
            )}
          />
          <span className="font-semibold text-lg text-white">
            {formatDisplayDate(date)}
          </span>
          {isToday && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-500 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-800">
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
}
