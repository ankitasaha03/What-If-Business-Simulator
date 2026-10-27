import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Truck,
  Gauge,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimulationResult } from '@/lib/types';
import { formatCurrency } from '@/lib/simulationEngine';

interface MetricSummaryCardsProps {
  simulationResult: SimulationResult;
}

export function MetricSummaryCards({ simulationResult }: MetricSummaryCardsProps) {
  const {
    baselineRevenue,
    simulatedRevenue,
    revenueDelta,
    baselineProfit,
    simulatedProfit,
    profitMarginPercent,
    profitMarginDelta,
    employeeUtilization,
    inventoryTurnoverDays,
    stockoutRiskDays,
    logisticsUtilization,
    fulfillmentDelayDays,
    feasibilityScore,
    bottleneckIndex,
  } = simulationResult;

  const revPercentChange = +(((simulatedRevenue - baselineRevenue) / baselineRevenue) * 100).toFixed(1);
  const profitPercentChange = +(((simulatedProfit - baselineProfit) / baselineProfit) * 100).toFixed(1);

  const cards = [
    {
      title: 'Projected Revenue',
      simulatedValue: formatCurrency(simulatedRevenue),
      baselineValue: formatCurrency(baselineRevenue),
      delta: `${revenueDelta >= 0 ? '+' : ''}${formatCurrency(revenueDelta)}`,
      percent: `${revPercentChange >= 0 ? '+' : ''}${revPercentChange}%`,
      isPositive: revPercentChange >= 0,
      icon: DollarSign,
      color: 'indigo',
      subtext: 'vs. baseline run-rate',
    },
    {
      title: 'Operating Profit',
      simulatedValue: formatCurrency(simulatedProfit),
      baselineValue: formatCurrency(baselineProfit),
      delta: `${profitMarginPercent}% Margin`,
      percent: `${profitMarginDelta >= 0 ? '+' : ''}${profitMarginDelta}% pts`,
      isPositive: profitPercentChange >= 0,
      icon: TrendingUp,
      color: profitPercentChange >= 0 ? 'emerald' : 'rose',
      subtext: `Baseline: ${formatCurrency(baselineProfit)} (20%)`,
    },
    {
      title: 'Workforce Load',
      simulatedValue: `${employeeUtilization}%`,
      baselineValue: '91% Base',
      delta: employeeUtilization > 100 ? `${employeeUtilization - 100}% Overload` : 'Within Limits',
      percent: `${employeeUtilization - 91 >= 0 ? '+' : ''}${employeeUtilization - 91}%`,
      isPositive: employeeUtilization <= 100,
      icon: Users,
      color: employeeUtilization > 115 ? 'rose' : employeeUtilization > 95 ? 'amber' : 'emerald',
      subtext: employeeUtilization > 100 ? 'Overtime required' : 'Optimal capacity',
    },
    {
      title: 'Inventory Buffer',
      simulatedValue: `${inventoryTurnoverDays} Days`,
      baselineValue: '42 Days Base',
      delta: stockoutRiskDays ? `Risk in ${stockoutRiskDays}d` : 'Stock Safe',
      percent: `${inventoryTurnoverDays - 42 >= 0 ? '+' : ''}${inventoryTurnoverDays - 42}d`,
      isPositive: !stockoutRiskDays,
      icon: Package,
      color: stockoutRiskDays ? 'rose' : inventoryTurnoverDays < 28 ? 'amber' : 'emerald',
      subtext: stockoutRiskDays ? 'Critical stockout alert' : 'Lead time covered',
    },
    {
      title: 'Logistics Strain',
      simulatedValue: `${logisticsUtilization}%`,
      baselineValue: '76% Base',
      delta: fulfillmentDelayDays > 0 ? `+${fulfillmentDelayDays}d Delay` : 'On Time (0d)',
      percent: `${logisticsUtilization - 76 >= 0 ? '+' : ''}${logisticsUtilization - 76}%`,
      isPositive: logisticsUtilization <= 100,
      icon: Truck,
      color: logisticsUtilization > 105 ? 'rose' : logisticsUtilization > 90 ? 'amber' : 'emerald',
      subtext: fulfillmentDelayDays > 0 ? 'Backlog forming' : 'Normal dispatch',
    },
    {
      title: 'Feasibility Score',
      simulatedValue: `${feasibilityScore}%`,
      baselineValue: 'Risk: ' + bottleneckIndex,
      delta: simulationResult.systemHealthStatus,
      percent: feasibilityScore >= 80 ? 'High' : feasibilityScore >= 60 ? 'Moderate' : 'Low',
      isPositive: feasibilityScore >= 70,
      icon: Gauge,
      color: feasibilityScore >= 80 ? 'emerald' : feasibilityScore >= 60 ? 'amber' : 'rose',
      subtext: 'Operational viability',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="relative overflow-hidden border-slate-800/80 bg-slate-900/70 hover:border-slate-700/80 transition-all p-4 flex flex-col justify-between"
          >
            {/* Top row: Title and Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 truncate">
                {card.title}
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  card.color === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : card.color === 'amber'
                    ? 'bg-amber-500/10 text-amber-400'
                    : card.color === 'rose'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            {/* Main Value */}
            <div className="space-y-1">
              <div className="text-xl font-bold tracking-tight text-white font-mono">
                {card.simulatedValue}
              </div>
              
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <Badge
                  variant={
                    card.isPositive
                      ? 'success'
                      : card.color === 'amber'
                      ? 'warning'
                      : 'destructive'
                  }
                  className="text-[10px] py-0 px-1.5 font-mono h-4 gap-0.5"
                >
                  {card.isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {card.percent}
                </Badge>
                <span className="text-slate-400 font-mono truncate text-[10px]">
                  {card.delta}
                </span>
              </div>
            </div>

            {/* Footer baseline comparison */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
              <span className="truncate">{card.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
