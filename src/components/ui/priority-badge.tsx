'use client';

import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityLabels = {
    high: 'High Priority',
    medium: 'Medium',
    low: 'Low Priority',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        `priority-${priority}`,
        className
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const categoryColors: Record<string, string> = {
    homework: 'from-blue-500/30 to-indigo-500/30 border-blue-500/40 text-blue-300',
    event: 'from-purple-500/30 to-pink-500/30 border-purple-500/40 text-purple-300',
    uniform: 'from-amber-500/30 to-orange-500/30 border-amber-500/40 text-amber-300',
    equipment: 'from-teal-500/30 to-cyan-500/30 border-teal-500/40 text-teal-300',
    activity: 'from-green-500/30 to-emerald-500/30 border-green-500/40 text-green-300',
  };

  const colorClass = categoryColors[category.toLowerCase()] || categoryColors.activity;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        'bg-gradient-to-r border',
        colorClass,
        className
      )}
    >
      {category}
    </span>
  );
}
