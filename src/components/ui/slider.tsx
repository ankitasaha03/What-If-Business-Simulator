import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  badgeValue?: string;
  className?: string;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'sky';
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit = '',
  badgeValue,
  className,
  colorScheme = 'indigo',
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const trackColors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
      <div className="flex items-center justify-between text-xs">
        {label && <span className="font-medium text-slate-300">{label}</span>}
        <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700">
          {badgeValue ?? `${value > 0 && unit === '%' ? '+' : ''}${value}${unit}`}
        </span>
      </div>
      <div className="relative flex items-center select-none touch-none w-full h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer focus:outline-none accent-indigo-500 border border-slate-700/60"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
