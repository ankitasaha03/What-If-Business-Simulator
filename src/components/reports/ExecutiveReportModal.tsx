'use client';

import React from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Building,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationResult, SimulationParameters } from '@/lib/types';
import { formatCurrency } from '@/lib/simulationEngine';

interface ExecutiveReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulationResult: SimulationResult;
  params: SimulationParameters;
}

export function ExecutiveReportModal({
  open,
  onOpenChange,
  simulationResult,
  params,
}: ExecutiveReportModalProps) {
  const [currentDate, setCurrentDate] = React.useState('October 28, 2026');

  React.useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      title: 'OmniSim Strategic Scenario Report',
      timestamp: new Date().toISOString(),
      parameters: params,
      simulationResult,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnisim-scenario-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Baseline', 'Simulated', 'Delta'],
      ['Monthly Revenue', simulationResult.baselineRevenue, simulationResult.simulatedRevenue, simulationResult.revenueDelta],
      ['Monthly Operating Profit', simulationResult.baselineProfit, simulationResult.simulatedProfit, simulationResult.simulatedProfit - simulationResult.baselineProfit],
      ['Operating Margin (%)', '20.0%', `${simulationResult.profitMarginPercent}%`, `${simulationResult.profitMarginDelta}%`],
      ['Workforce Utilization (%)', '91%', `${simulationResult.employeeUtilization}%`, `${simulationResult.employeeUtilization - 91}%`],
      ['Inventory Buffer (Days)', '42', `${simulationResult.inventoryTurnoverDays}`, `${simulationResult.inventoryTurnoverDays - 42}`],
      ['Logistics Utilization (%)', '76%', `${simulationResult.logisticsUtilization}%`, `${simulationResult.logisticsUtilization - 76}%`],
      ['Fulfillment Delay (Days)', '0', `${simulationResult.fulfillmentDelayDays}`, `${simulationResult.fulfillmentDelayDays}`],
      ['Overall Feasibility (%)', '100%', `${simulationResult.feasibilityScore}%`, `${simulationResult.feasibilityScore - 100}%`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnisim-scenario-brief-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono">
            CONFIDENTIAL • BOARD BRIEFING
          </Badge>
          <Badge
            variant={
              simulationResult.feasibilityScore >= 80
                ? 'success'
                : simulationResult.feasibilityScore >= 60
                ? 'warning'
                : 'destructive'
            }
            className="text-[10px] font-mono"
          >
            {simulationResult.feasibilityScore}% Feasible
          </Badge>
        </div>
        <DialogTitle className="mt-1">
          Executive Decision Intelligence & Risk Assessment Report
        </DialogTitle>
        <DialogDescription>
          OmniSim Automated Strategic Impact Synthesis • Prepared for Executive Management
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="space-y-6 print:p-0 print:text-black">
        {/* Document Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-400" />
            <span>Target Org: Apex Dynamics Corp</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>Date: {currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Scenario: Sales {params.salesGrowth >= 0 ? `+${params.salesGrowth}%` : `${params.salesGrowth}%`}, Headcount {params.headcountDelta >= 0 ? `+${params.headcountDelta}` : params.headcountDelta}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Strategic Feasibility Overview
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under the tested parameters, the organization projects monthly revenue of{' '}
            <strong className="text-white">{formatCurrency(simulationResult.simulatedRevenue)}</strong> (
            {simulationResult.revenueDelta >= 0 ? '+' : ''}
            {formatCurrency(simulationResult.revenueDelta)} vs baseline) generating an operating profit of{' '}
            <strong className="text-white">{formatCurrency(simulationResult.simulatedProfit)}</strong> at{' '}
            <strong className="text-indigo-400">{simulationResult.profitMarginPercent}%</strong> margin.
            {simulationResult.feasibilityScore >= 80
              ? ' Operational infrastructure is rated OPTIMAL and capable of executing this expansion without significant capital investments.'
              : simulationResult.feasibilityScore >= 60
              ? ' Operational infrastructure is under MODERATE STRAIN; execution requires targeted overtime authorization and 3PL freight scaling.'
              : ' CRITICAL BOTTLENECKS DETECTED: Physical capacity ceilings will be exceeded resulting in unfulfilled order penalties and substantial fulfillment backlog.'}
          </p>
        </div>

        {/* Metric Comparison Audit Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Core Financial & Constraint Ratios
          </h4>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Performance Dimension</th>
                  <th className="py-2.5 px-3">Baseline</th>
                  <th className="py-2.5 px-3">Simulated Target</th>
                  <th className="py-2.5 px-3">Variance / Delta</th>
                  <th className="py-2.5 px-3 text-right">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                <tr>
                  <td className="py-2 px-3 text-slate-200">Monthly Gross Revenue</td>
                  <td className="py-2 px-3 text-slate-400">{formatCurrency(simulationResult.baselineRevenue)}</td>
                  <td className="py-2 px-3 font-bold text-white">{formatCurrency(simulationResult.simulatedRevenue)}</td>
                  <td className="py-2 px-3 text-emerald-400">{simulationResult.revenueDelta >= 0 ? '+' : ''}{formatCurrency(simulationResult.revenueDelta)}</td>
                  <td className="py-2 px-3 text-right">
                    <Badge variant="success" className="text-[10px] py-0 px-1.5">Profitable</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-200">Operating Margin (%)</td>
                  <td className="py-2 px-3 text-slate-400">20.0%</td>
                  <td className="py-2 px-3 font-bold text-white">{simulationResult.profitMarginPercent}%</td>
                  <td className="py-2 px-3 text-indigo-400">{simulationResult.profitMarginDelta >= 0 ? '+' : ''}{simulationResult.profitMarginDelta}% pts</td>
                  <td className="py-2 px-3 text-right">
                    <Badge variant={simulationResult.profitMarginPercent >= 18 ? 'success' : 'warning'} className="text-[10px] py-0 px-1.5">
                      {simulationResult.profitMarginPercent >= 18 ? 'Strong' : 'Compressed'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-200">Shopfloor Workforce Load</td>
                  <td className="py-2 px-3 text-slate-400">91%</td>
                  <td className="py-2 px-3 font-bold text-white">{simulationResult.employeeUtilization}%</td>
                  <td className="py-2 px-3 text-amber-400">{simulationResult.employeeUtilization - 91 >= 0 ? '+' : ''}{simulationResult.employeeUtilization - 91}%</td>
                  <td className="py-2 px-3 text-right">
                    <Badge variant={simulationResult.employeeUtilization <= 100 ? 'success' : 'destructive'} className="text-[10px] py-0 px-1.5">
                      {simulationResult.employeeUtilization <= 100 ? 'In Limit' : 'Overload'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-200">Inventory Days of Supply</td>
                  <td className="py-2 px-3 text-slate-400">42 Days</td>
                  <td className="py-2 px-3 font-bold text-white">{simulationResult.inventoryTurnoverDays} Days</td>
                  <td className="py-2 px-3 text-slate-300">{simulationResult.inventoryTurnoverDays - 42} Days</td>
                  <td className="py-2 px-3 text-right">
                    <Badge variant={!simulationResult.stockoutRiskDays ? 'success' : 'destructive'} className="text-[10px] py-0 px-1.5">
                      {!simulationResult.stockoutRiskDays ? 'Sufficient' : 'Stockout'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-200">Logistics Delay Lag</td>
                  <td className="py-2 px-3 text-slate-400">0.0 Days</td>
                  <td className="py-2 px-3 font-bold text-white">+{simulationResult.fulfillmentDelayDays} Days</td>
                  <td className="py-2 px-3 text-rose-400">+{simulationResult.fulfillmentDelayDays} Days</td>
                  <td className="py-2 px-3 text-right">
                    <Badge variant={simulationResult.fulfillmentDelayDays === 0 ? 'success' : 'warning'} className="text-[10px] py-0 px-1.5">
                      {simulationResult.fulfillmentDelayDays === 0 ? 'Normal' : 'Backlog'}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Prioritized Action Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Prioritized Board Action Plan
          </h4>
          <div className="space-y-2 text-xs">
            {simulationResult.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-3"
              >
                <div className="h-5 w-5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 font-bold font-mono text-[10px]">
                  {i + 1}
                </div>
                <div className="text-slate-300 leading-relaxed">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
          <span>Export CSV</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5 text-sky-400" />
          <span>Export JSON</span>
        </Button>
        <Button variant="default" size="sm" onClick={handlePrint} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
          <Printer className="h-3.5 w-3.5" />
          <span>Print Executive Brief</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
