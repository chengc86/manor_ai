'use client';

import { cn } from '@/lib/utils';
import type { YearGroupDisplay } from '@/types';

interface YearGroupTabsProps {
  yearGroups: YearGroupDisplay[];
  activeYearGroup: string;
  onChange: (id: string) => void;
}

export function YearGroupTabs({
  yearGroups,
  activeYearGroup,
  onChange,
}: YearGroupTabsProps) {
  const groups = Array.isArray(yearGroups) ? yearGroups : [];

  if (groups.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="px-6 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-500">
          Loading year groups...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {groups.map((yg) => (
        <button
          key={yg.id}
          onClick={() => onChange(yg.id)}
          className={cn(
            'px-5 py-3 rounded-2xl font-semibold text-lg transition-colors',
            activeYearGroup === yg.id
              ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          {yg.name}
        </button>
      ))}
    </div>
  );
}
