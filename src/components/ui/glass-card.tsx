'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'heavy';
  hover3D?: boolean;
  glow?: 'green' | 'emerald' | 'gold' | 'none';
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover3D = true,
  glow = 'none',
  ...props
}: GlassCardProps) {
  const variants = {
    default: 'glass',
    light: 'glass-light',
    heavy: 'glass-heavy',
  };

  const glowStyles = {
    green: 'hover:glow-green',
    emerald: 'hover:glow-emerald',
    gold: 'hover:glow-gold',
    none: '',
  };

  return (
    <motion.div
      className={cn(
        variants[variant],
        hover3D && 'glass-card',
        glowStyles[glow],
        'p-6',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={
        hover3D
          ? {
              y: -4,
              rotateX: 2,
              transition: { duration: 0.3 },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass p-6', className)}>
      <div className="space-y-4">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
    </div>
  );
}
