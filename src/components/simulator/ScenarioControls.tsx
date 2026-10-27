'use client';

import React from 'react';
import {
  TrendingUp,
  Users,
  Package,
  Cpu,
  Truck,
  Percent,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationParameters, SimulationResult, ScenarioPreset } from '@/lib/types';
import { SCENARIO_PRESETS, DEFAULT_PARAMETERS } from '@/lib/simulationEngine';

interface ScenarioControlsProps {
  params: SimulationParameters;
  onChange: (params: SimulationParameters) => void;
  simulationResult: SimulationResult;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onReset: () => void;
}

export function ScenarioControls({
  params,
  onChange,
  simulationResult,
  onSelectPreset,
  onReset,
}: ScenarioControlsProps) {
  const updateParam = <K extends keyof SimulationParameters>(
    key: K,
    value: SimulationParameters[K]
  ) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2">
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Quick What-If Scenarios:</span>
        </div>
        {SCENARIO_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onSelectPreset(preset)}
            className="text-xs h-7 gap-1.5 border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 text-slate-200"
          >
            <span>{preset.name}</span>
            <Badge variant="secondary" className="text-[9px] py-0 px-1 font-mono">
              {preset.tag}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Main Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Commercial Demand & Pricing */}
        <Card className="border-slate-800/90 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Commercial & Demand Drive
              </span>
              <Badge variant="default" className="text-[10px]">Sales Model</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <Slider
              label="Target Sales Volume Growth"
              value={params.salesGrowth}
              min={-20}
              max={100}
              step={1}
              unit="%"
              onChange={(val) => updateParam('salesGrowth', val)}
            />
            <p className="text-[11px] text-slate-400 -mt-2">
              Baseline: 18,500 units/mo. At {params.salesGrowth > 0 ? `+${params.salesGrowth}%` : `${params.salesGrowth}%`}, demand is ~{Math.round(18500 * (1 + params.salesGrowth / 100)).toLocaleString()} units.
            </p>

            <Slider
              label="Average Selling Price (ASP) Adjustment"
              value={params.priceAdjustment}
              min={-20}
              max={30}
              step={1}
              unit="%"
              onChange={(val) => updateParam('priceAdjustment', val)}
            />
            <p className="text-[11px] text-slate-400 -mt-2">
              Price elasticity adjusts demand volume dynamically.
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Workforce & Labor Scale */}
        <Card className="border-slate-800/90 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-sky-300">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" />
                Workforce Capacity
              </span>
              <Badge
                variant={simulationResult.employeeUtilization > 100 ? 'destructive' : 'success'}
                className="text-[10px]"
              >
                {simulationResult.employeeUtilization}% Load
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <Slider
              label="Headcount Adjustment"
              value={params.headcountDelta}
              min={-50}
              max={100}
              step={1}
              unit=" staff"
              badgeValue={`${params.headcountDelta >= 0 ? '+' : ''}${params.headcountDelta} staff`}
              onChange={(val) => updateParam('headcountDelta', val)}
            />
            <p className="text-[11px] text-slate-400 -mt-2">
              Base: 210 staff (140 direct labor). Current effective labor: {140 + Math.round(params.headcountDelta * 0.75)} direct technicians.
            </p>

            {/* Overtime Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-slate-200">
                  Allow Overtime Shifts (1.5x)
                </span>
                <p className="text-[10px] text-slate-400">
                  Unlocks +25% labor flex at overtime wage premium
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateParam('overtimeAllowed', !params.overtimeAllowed)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  params.overtimeAllowed ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    params.overtimeAllowed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Factory Lines & Shift Scheduling */}
        <Card className="border-slate-800/90 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-amber-400" />
                Factory Production & Shifts
              </span>
              <Badge
                variant={simulationResult.machineUtilization > 100 ? 'destructive' : 'warning'}
                className="text-[10px]"
              >
                {simulationResult.machineUtilization}% Machine
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Shift Schedule Model
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { shifts: 1, label: '1 Shift (8h)', cap: '11.5k units' },
                  { shifts: 2, label: '2 Shifts (16h)', cap: '21.0k units' },
                  { shifts: 3, label: '3 Shifts (24h)', cap: '30.5k units' },
                ].map((s) => (
                  <button
                    key={s.shifts}
                    type="button"
                    onClick={() => updateParam('shiftCount', s.shifts)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      params.shiftCount === s.shifts
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.cap}</div>
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Line Equipment OEE / Efficiency"
              value={params.machineEfficiency}
              min={70}
              max={120}
              step={1}
              unit="%"
              onChange={(val) => updateParam('machineEfficiency', val)}
            />
          </CardContent>
        </Card>

        {/* Card 4: Inventory Buffers & Safety Stock */}
        <Card className="border-slate-800/90 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-400" />
                Raw Material & Component Buffer
              </span>
              <Badge
                variant={simulationResult.stockoutRiskDays ? 'destructive' : 'success'}
                className="text-[10px]"
              >
                {simulationResult.inventoryTurnoverDays} Days Stock
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Slider
              label="Safety Stock Target"
              value={params.inventoryBufferDays}
              min={5}
              max={90}
              step={1}
              unit=" days"
              badgeValue={`${params.inventoryBufferDays} days`}
              onChange={(val) => updateParam('inventoryBufferDays', val)}
            />
            <p className="text-[11px] text-slate-400">
              Standard lead-time: 25 days. Buffers below 20 days trigger immediate stockout risk during demand spikes.
            </p>

            {simulationResult.stockoutRiskDays && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="font-bold">⚠️ Warning:</span>
                <span>Projected stockout in ~{simulationResult.stockoutRiskDays} days without replenishment!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 5: Logistics Fleet & 3PL Carrier Flex */}
        <Card className="border-slate-800/90 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-purple-300">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-400" />
                Logistics & 3PL Outsourcing
              </span>
              <Badge
                variant={simulationResult.fulfillmentDelayDays > 0 ? 'destructive' : 'secondary'}
                className="text-[10px]"
              >
                {simulationResult.fulfillmentDelayDays > 0 ? `+${simulationResult.fulfillmentDelayDays}d Delay` : 'On Time'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Slider
              label="Dedicated Fleet Capacity Adjustment"
              value={params.fleetCapacityDelta}
              min={-30}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => updateParam('fleetCapacityDelta', val)}
            />

            <Slider
              label="3PL Partner Outsourcing Allocation"
              value={params.thirdPartyLogisticsShare}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => updateParam('thirdPartyLogisticsShare', val)}
            />

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-slate-200">
                  Expedited Priority Air/Hotshot Freight
                </span>
                <p className="text-[10px] text-slate-400">
                  Cuts delivery lag by 50% ($135k surcharge)
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateParam('expeditedShipping', !params.expeditedShipping)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  params.expeditedShipping ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    params.expeditedShipping ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Live Executive Simulation Summary */}
        <Card className="border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900">
          <CardHeader className="pb-3 border-b border-indigo-500/20">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-indigo-200">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Live Scenario Verdict
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {simulationResult.feasibilityScore}% Feasible
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Revenue:</span>
                <span className="font-bold text-white">
                  ${(simulationResult.simulatedRevenue / 1_000_000).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operating Margin:</span>
                <span
                  className={`font-bold ${
                    simulationResult.profitMarginPercent >= 20 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {simulationResult.profitMarginPercent}% ({simulationResult.profitMarginDelta >= 0 ? '+' : ''}{simulationResult.profitMarginDelta}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Logistics Delay:</span>
                <span
                  className={`font-bold ${
                    simulationResult.fulfillmentDelayDays > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationResult.fulfillmentDelayDays} business days
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-200">Key Bottlenecks:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-400 mt-1">
                {simulationResult.bottlenecks.slice(0, 2).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              className="w-full mt-2 gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All Sliders to Default
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
