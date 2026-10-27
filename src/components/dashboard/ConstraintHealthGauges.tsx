import React from 'react';
import {
  Users,
  Package,
  Cpu,
  Truck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SimulationResult } from '@/lib/types';

interface ConstraintHealthGaugesProps {
  simulationResult: SimulationResult;
  onNavigateToConstraints?: () => void;
}

export function ConstraintHealthGauges({
  simulationResult,
  onNavigateToConstraints,
}: ConstraintHealthGaugesProps) {
  const {
    employeeUtilization,
    machineUtilization,
    inventoryTurnoverDays,
    stockoutRiskDays,
    logisticsUtilization,
    fulfillmentDelayDays,
  } = simulationResult;

  const meters = [
    {
      id: 'workforce',
      title: 'Shopfloor Workforce Capacity',
      icon: Users,
      value: employeeUtilization,
      limitText: `${employeeUtilization}% of base capacity`,
      threshold: 100,
      status: employeeUtilization > 115 ? 'critical' : employeeUtilization > 95 ? 'warning' : 'healthy',
      details: employeeUtilization > 100
        ? `Overload: +${employeeUtilization - 100}% over standard shift hours. Overtime authorized.`
        : 'Workforce within healthy 40-hour weekly operating envelope.',
      badgeText: employeeUtilization > 100 ? 'Overtime Breach' : 'Operational',
      submetric: `${Math.round(employeeUtilization * 224)} hrs / 22,400 base hrs`,
    },
    {
      id: 'production',
      title: 'Factory Machine Utilization',
      icon: Cpu,
      value: machineUtilization,
      limitText: `${machineUtilization}% machine line saturation`,
      threshold: 100,
      status: machineUtilization > 105 ? 'critical' : machineUtilization > 92 ? 'warning' : 'healthy',
      details: machineUtilization > 100
        ? `Output threshold exceeded by ${machineUtilization - 100}%. Line queue bottleneck.`
        : 'CNC machining & assembly lines running at optimal throughput.',
      badgeText: machineUtilization > 100 ? 'Capacity Saturated' : 'Smooth Flow',
      submetric: `${Math.round(machineUtilization * 210)} units / 21,000 max units`,
    },
    {
      id: 'inventory',
      title: 'Raw Material Safety Stock',
      icon: Package,
      value: Math.min(100, Math.round((inventoryTurnoverDays / 45) * 100)),
      limitText: `${inventoryTurnoverDays} Days of supply remaining`,
      threshold: 40,
      status: stockoutRiskDays ? 'critical' : inventoryTurnoverDays < 28 ? 'warning' : 'healthy',
      details: stockoutRiskDays
        ? `⚠️ CRITICAL: Projected stockout in ~${stockoutRiskDays} days at current consumption rate!`
        : 'Component buffer sufficient for supplier replenishment lead-time.',
      badgeText: stockoutRiskDays ? `Stockout in ${stockoutRiskDays}d` : `${inventoryTurnoverDays}d Safe`,
      submetric: `Safety buffer: ${inventoryTurnoverDays}d (Standard: 42d)`,
    },
    {
      id: 'logistics',
      title: 'Logistics & Fleet Dispatch',
      icon: Truck,
      value: logisticsUtilization,
      limitText: `${logisticsUtilization}% fleet capacity utilized`,
      threshold: 100,
      status: logisticsUtilization > 105 ? 'critical' : logisticsUtilization > 90 ? 'warning' : 'healthy',
      details: fulfillmentDelayDays > 0
        ? `Backlog: Projected delivery delay of +${fulfillmentDelayDays} business days to customers.`
        : 'Zero fulfillment lag; trailers and 3PL carriers dispatched on schedule.',
      badgeText: fulfillmentDelayDays > 0 ? `+${fulfillmentDelayDays}d Backlog` : 'Zero Lag',
      submetric: `Fulfillment Delay: ${fulfillmentDelayDays > 0 ? `${fulfillmentDelayDays} days` : '0 days (Normal)'}`,
    },
  ];

  const getStatusBadge = (status: string, text: string) => {
    if (status === 'critical') {
      return (
        <Badge variant="destructive" className="font-mono text-[10px] py-0 px-2 gap-1 animate-pulse">
          <AlertOctagon className="w-3 h-3" />
          {text}
        </Badge>
      );
    }
    if (status === 'warning') {
      return (
        <Badge variant="warning" className="font-mono text-[10px] py-0 px-2 gap-1">
          <AlertTriangle className="w-3 h-3" />
          {text}
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="font-mono text-[10px] py-0 px-2 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        {text}
      </Badge>
    );
  };

  const getProgressColor = (status: string) => {
    if (status === 'critical') return 'bg-rose-500';
    if (status === 'warning') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <Card className="border-slate-800/90 bg-slate-900/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Constraint Health Meters & Operational Limits
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stress analysis against physical workforce, assembly lines, component buffers, and fleet
          </p>
        </div>
        {onNavigateToConstraints && (
          <button
            onClick={onNavigateToConstraints}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Deep Dive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {meters.map((meter) => {
            const Icon = meter.icon;
            return (
              <div
                key={meter.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-3 transition-all hover:border-slate-700/80"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        meter.status === 'critical'
                          ? 'bg-rose-500/15 text-rose-400'
                          : meter.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {meter.title}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Value */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {meter.limitText}
                    </span>
                    {getStatusBadge(meter.status, meter.badgeText)}
                  </div>
                  <Progress
                    value={Math.min(100, meter.value)}
                    indicatorColor={getProgressColor(meter.status)}
                    className="h-2.5"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>0%</span>
                    <span>100% Limit</span>
                    <span>{meter.value}%</span>
                  </div>
                </div>

                {/* Diagnostic Details */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-snug min-h-[36px]">
                  {meter.details}
                </div>

                <div className="pt-1 text-[10px] font-mono text-slate-500">
                  {meter.submetric}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
