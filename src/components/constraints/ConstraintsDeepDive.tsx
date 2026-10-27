'use client';

import React from 'react';
import {
  ShieldAlert,
  Users,
  Cpu,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimulationResult, SimulationParameters } from '@/lib/types';

interface ConstraintsDeepDiveProps {
  simulationResult: SimulationResult;
  params: SimulationParameters;
  onUpdateParams: (newParams: SimulationParameters) => void;
}

export function ConstraintsDeepDive({
  simulationResult,
  params,
  onUpdateParams,
}: ConstraintsDeepDiveProps) {
  const { constraints, bottlenecks, recommendations } = simulationResult;

  // Department breakdown detail list
  const departments = [
    {
      name: 'Direct Shopfloor Assembly',
      icon: Users,
      category: 'Workforce',
      demand: `${Math.round(simulationResult.employeeUtilization * 224)} hrs`,
      capacity: '22,400 standard hrs',
      utilization: `${simulationResult.employeeUtilization}%`,
      status: simulationResult.employeeUtilization > 115 ? 'critical' : simulationResult.employeeUtilization > 95 ? 'warning' : 'healthy',
      mitigationAction: 'Hire +10 Techs',
      applyMitigation: () => onUpdateParams({ ...params, headcountDelta: params.headcountDelta + 10, overtimeAllowed: true }),
      impact: 'Reduces workforce utilization by ~8%',
    },
    {
      name: 'CNC Machining & Final QA Lines',
      icon: Cpu,
      category: 'Production',
      demand: `${Math.round(18500 * (1 + params.salesGrowth / 100))} units/mo`,
      capacity: params.shiftCount === 1 ? '11,500 units' : params.shiftCount === 2 ? '21,000 units' : '30,500 units',
      utilization: `${simulationResult.machineUtilization}%`,
      status: simulationResult.machineUtilization > 105 ? 'critical' : simulationResult.machineUtilization > 92 ? 'warning' : 'healthy',
      mitigationAction: params.shiftCount < 3 ? 'Activate Shift 3' : 'Increase Efficiency to 110%',
      applyMitigation: () =>
        params.shiftCount < 3
          ? onUpdateParams({ ...params, shiftCount: 3 })
          : onUpdateParams({ ...params, machineEfficiency: 110 }),
      impact: 'Adds +40% machine throughput',
    },
    {
      name: 'Raw Material & Component Buffer',
      icon: Package,
      category: 'Inventory',
      demand: `${simulationResult.inventoryTurnoverDays} days available`,
      capacity: 'Minimum safe buffer: 25 days',
      utilization: simulationResult.stockoutRiskDays ? 'Risk in ' + simulationResult.stockoutRiskDays + 'd' : 'Safe',
      status: simulationResult.stockoutRiskDays ? 'critical' : simulationResult.inventoryTurnoverDays < 28 ? 'warning' : 'healthy',
      mitigationAction: 'Boost Buffer +20 Days',
      applyMitigation: () => onUpdateParams({ ...params, inventoryBufferDays: params.inventoryBufferDays + 20 }),
      impact: 'Guarantees lead-time coverage',
    },
    {
      name: 'Freight Fleet & Outbound Logistics',
      icon: Truck,
      category: 'Logistics',
      demand: `${Math.round(18500 * (1 + params.salesGrowth / 100))} orders/mo`,
      capacity: '19,500 fleet cap + 3PL',
      utilization: `${simulationResult.logisticsUtilization}%`,
      status: simulationResult.logisticsUtilization > 105 ? 'critical' : simulationResult.logisticsUtilization > 90 ? 'warning' : 'healthy',
      mitigationAction: 'Scale 3PL to 45%',
      applyMitigation: () => onUpdateParams({ ...params, thirdPartyLogisticsShare: Math.min(100, params.thirdPartyLogisticsShare + 25) }),
      impact: 'Absorbs shipment overflow immediately',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Constraint Executive Verdict */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Enterprise Resource Constraint Diagnostics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies theoretical and physical ceiling limits across workforce, tooling, inventory, and logistics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              simulationResult.feasibilityScore >= 80
                ? 'success'
                : simulationResult.feasibilityScore >= 60
                ? 'warning'
                : 'destructive'
            }
            className="text-xs py-1 px-3 font-semibold font-mono"
          >
            {simulationResult.feasibilityScore}% Operational Feasibility
          </Badge>
        </div>
      </div>

      {/* Constraints Audit Table */}
      <Card className="border-slate-800/90 bg-slate-900/70 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-sm font-semibold text-slate-200">
            Departmental Constraint & Capacity Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Operational Pillar</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current / Projected Demand</th>
                  <th className="py-3 px-4">Effective Ceiling</th>
                  <th className="py-3 px-4">Utilization</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">One-Click Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {departments.map((dept, i) => {
                  const Icon = dept.icon;
                  return (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-200 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700/60">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{dept.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans">{dept.category}</td>
                      <td className="py-3.5 px-4 text-slate-200 font-semibold">{dept.demand}</td>
                      <td className="py-3.5 px-4 text-slate-400">{dept.capacity}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{dept.utilization}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <Badge
                          variant={
                            dept.status === 'critical'
                              ? 'destructive'
                              : dept.status === 'warning'
                              ? 'warning'
                              : 'success'
                          }
                          className="text-[10px] py-0 px-2"
                        >
                          {dept.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={dept.applyMitigation}
                          className="h-7 text-[11px] gap-1.5 border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/40 text-indigo-200"
                        >
                          <Wrench className="h-3 w-3 text-indigo-400" />
                          <span>{dept.mitigationAction}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Identified Critical Failure Points & Strategic Fixes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-rose-500/30 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-rose-500/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-300">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Identified Bottlenecks & Operational Failure Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {bottlenecks.map((b, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-rose-500/20 bg-rose-950/20 text-xs text-rose-200/90 leading-relaxed flex items-start gap-2.5"
              >
                <span className="font-mono font-bold text-rose-400 mt-0.5">#{i + 1}</span>
                <span>{b}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-slate-900/70">
          <CardHeader className="pb-3 border-b border-emerald-500/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Executive Action Plan & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {recommendations.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-200/90 leading-relaxed flex items-start gap-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
