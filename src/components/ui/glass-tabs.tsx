'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GlassTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function GlassTabs({ tabs, activeTab, onChange, className }: GlassTabsProps) {
  return (
    <div className={cn('glass-tabs', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'glass-tab relative flex items-center gap-2',
            activeTab === tab.id && 'glass-tab-active'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-primary/30 to-accent-emerald/30"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

interface GlassTabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassTabPanels({ children, className }: GlassTabPanelsProps) {
  return <div className={cn('mt-6', className)}>{children}</div>;
}

interface GlassTabPanelProps {
  children: React.ReactNode;
  tabId: string;
  activeTab: string;
  className?: string;
}

export function GlassTabPanel({
  children,
  tabId,
  activeTab,
  className,
}: GlassTabPanelProps) {
  if (tabId !== activeTab) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
