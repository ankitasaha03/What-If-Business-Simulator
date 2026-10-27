'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SimulationResult } from '@/lib/types';

interface FeasibilityRadarChartProps {
  simulationResult: SimulationResult;
}

export function FeasibilityRadarChart({ simulationResult }: FeasibilityRadarChartProps) {
  const { dimensionScores } = simulationResult;

  const data = [
    { subject: 'Workforce', score: dimensionScores.workforce, fullMark: 100 },
    { subject: 'Production', score: dimensionScores.production, fullMark: 100 },
    { subject: 'Inventory', score: dimensionScores.inventory, fullMark: 100 },
    { subject: 'Logistics', score: dimensionScores.logistics, fullMark: 100 },
    { subject: 'Financial Margin', score: dimensionScores.financial, fullMark: 100 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono">
          <p className="font-bold text-white">{item.subject}</p>
          <p className="text-indigo-400 font-semibold mt-0.5">
            Health Score: {item.score} / 100
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-800/90 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Operational Balance Radar
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            5-pillar organizational stress assessment (100 = Optimal state)
          </p>
        </div>
        <div className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
          Avg: {Math.round(
            (dimensionScores.workforce +
              dimensionScores.production +
              dimensionScores.inventory +
              dimensionScores.logistics +
              dimensionScores.financial) /
              5
          )}%
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#334155" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="#94a3b8"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#475569"
                tick={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Health Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
