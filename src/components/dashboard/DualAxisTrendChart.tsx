'use client';

import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SimulationResult } from '@/lib/types';
import { formatCurrency } from '@/lib/simulationEngine';

interface DualAxisTrendChartProps {
  simulationResult: SimulationResult;
}

export function DualAxisTrendChart({ simulationResult }: DualAxisTrendChartProps) {
  const data = simulationResult.projections.map((p) => ({
    name: p.month,
    'Baseline Revenue': +(p.baselineRevenue / 1_000_000).toFixed(2),
    'Simulated Revenue': +(p.simulatedRevenue / 1_000_000).toFixed(2),
    'Operational Cost': +(p.operationalCost / 1_000_000).toFixed(2),
    'Bottleneck Risk': p.bottleneckRisk,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 font-mono">
          <p className="font-bold text-white mb-1">{label} Projections</p>
          {payload.map((item: any, index: number) => {
            const isRisk = item.dataKey === 'Bottleneck Risk';
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}:
                </span>
                <span className="font-semibold text-white">
                  {isRisk ? `${item.value}% Risk` : `$${item.value}M`}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-800/90 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Dual-Axis Financial & Bottleneck Stress Forecast
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            6-Month Trajectory: Simulated Revenue vs Operating Costs (Left Axis $M) against Bottleneck Risk Index (Right Axis %)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Opex
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Risk Index
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />
              
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `$${val}M`}
                domain={['auto', 'auto']}
              />
              
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 100]}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Simulated Revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Operational Cost"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#costGrad)"
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Baseline Revenue"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Bottleneck Risk"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
