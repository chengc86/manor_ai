'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function GlassButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: GlassButtonProps) {
  const variants = {
    default: 'glass-button',
    primary: 'glass-button-primary',
    danger:
      'glass-button bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-500/40 hover:from-red-500/40 hover:to-pink-500/40',
    success:
      'glass-button bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-500/40 hover:from-emerald-500/40 hover:to-teal-500/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-xl',
    lg: 'px-7 py-3.5 text-lg rounded-2xl',
  };

  return (
    <motion.button
      className={cn(
        variants[variant],
        sizes[size],
        'inline-flex items-center justify-center gap-2 font-medium',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        className
      )}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="w-4 h-4">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && <span className="w-4 h-4">{rightIcon}</span>}
    </motion.button>
  );
}
