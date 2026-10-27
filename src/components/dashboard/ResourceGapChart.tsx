'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SimulationResult } from '@/lib/types';

interface ResourceGapChartProps {
  simulationResult: SimulationResult;
}

export function ResourceGapChart({ simulationResult }: ResourceGapChartProps) {
  const { constraints } = simulationResult;

  // Normalized to percentage of baseline capacity (100% = Baseline limit)
  const data = [
    {
      pillar: 'Workforce',
      'Available Capacity': 100,
      'Projected Demand': simulationResult.employeeUtilization,
      gap: simulationResult.employeeUtilization - 100,
      unit: '% of standard hours',
    },
    {
      pillar: 'Factory Lines',
      'Available Capacity': 100,
      'Projected Demand': simulationResult.machineUtilization,
      gap: simulationResult.machineUtilization - 100,
      unit: '% of machine capacity',
    },
    {
      pillar: 'Inventory Days',
      'Available Capacity': 42,
      'Projected Demand': simulationResult.inventoryTurnoverDays,
      gap: simulationResult.inventoryTurnoverDays - 42,
      unit: 'days of supply',
    },
    {
      pillar: 'Fleet Logistics',
      'Available Capacity': 100,
      'Projected Demand': simulationResult.logisticsUtilization,
      gap: simulationResult.logisticsUtilization - 100,
      unit: '% of dispatch capacity',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = data.find((d) => d.pillar === label);
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1 font-mono">
          <p className="font-bold text-white mb-1.5">{label} Headroom Analysis</p>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Available Capacity:</span>
            <span className="font-semibold text-sky-400">
              {payload[0]?.value} {item?.unit}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Projected Demand:</span>
            <span className="font-semibold text-rose-400">
              {payload[1]?.value} {item?.unit}
            </span>
          </div>
          {item && item.gap !== undefined && (
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4">
              <span className="text-slate-400">Capacity Gap:</span>
              <span
                className={`font-bold ${
                  item.gap > 0 && label !== 'Inventory Days'
                    ? 'text-rose-400'
                    : item.gap < 0 && label === 'Inventory Days'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {item.gap > 0 ? `+${item.gap}` : item.gap} {item.unit}
              </span>
            </div>
          )}
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
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Resource Gap Breakdown: Available vs Projected Demand
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing operational headroom or deficit across the 4 key business constraints
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Capacity Limit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Scenario Demand
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="pillar" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.7} />
              <Bar dataKey="Available Capacity" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar
                dataKey="Projected Demand"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
