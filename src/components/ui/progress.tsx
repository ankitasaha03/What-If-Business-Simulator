import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
  variant?: 'default' | 'emerald' | 'amber' | 'rose';
}

export function Progress({
  className,
  value,
  indicatorColor,
  variant = 'default',
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantColors = {
    default: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-500 ease-out rounded-full',
          indicatorColor || variantColors[variant]
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
