'use client';

import { motion } from 'framer-motion';
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
  // Safety check for non-array data
  const groups = Array.isArray(yearGroups) ? yearGroups : [];

  if (groups.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="glass-light px-6 py-3 rounded-2xl text-white/50">
          Loading year groups...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {groups.map((yg, index) => (
        <motion.button
          key={yg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onChange(yg.id)}
          className={cn(
            'relative px-5 py-3 rounded-2xl font-semibold text-lg',
            'transition-all duration-300 ease-out',
            'transform-gpu perspective-1000',
            activeYearGroup === yg.id
              ? 'text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          )}
          whileHover={{
            scale: 1.05,
            rotateY: 5,
          }}
          whileTap={{ scale: 0.98 }}
        >
          {activeYearGroup === yg.id && (
            <motion.div
              layoutId="activeYearGroup"
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(74, 222, 128, 0.4), rgba(52, 211, 153, 0.4))',
                boxShadow: '0 0 30px rgba(74, 222, 128, 0.3)',
              }}
              transition={{ type: 'spring', duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{yg.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
