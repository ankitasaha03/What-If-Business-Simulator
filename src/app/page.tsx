'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  ShieldAlert,
  FileText,
  LayoutDashboard,
  Bot,
  Zap,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { MetricSummaryCards } from '@/components/dashboard/MetricSummaryCards';
import { ConstraintHealthGauges } from '@/components/dashboard/ConstraintHealthGauges';
import { DualAxisTrendChart } from '@/components/dashboard/DualAxisTrendChart';
import { ResourceGapChart } from '@/components/dashboard/ResourceGapChart';
import { FeasibilityRadarChart } from '@/components/dashboard/FeasibilityRadarChart';
import { ScenarioControls } from '@/components/simulator/ScenarioControls';
import { ConstraintsDeepDive } from '@/components/constraints/ConstraintsDeepDive';
import { AIChatbotPanel } from '@/components/chat/AIChatbotPanel';
import { ExecutiveReportModal } from '@/components/reports/ExecutiveReportModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationParameters, ScenarioPreset } from '@/lib/types';
import {
  runBusinessSimulation,
  DEFAULT_PARAMETERS,
  SCENARIO_PRESETS,
} from '@/lib/simulationEngine';

export default function OmniSimApp() {
  const [params, setParams] = useState<SimulationParameters>(DEFAULT_PARAMETERS);
  const [activePresetId, setActivePresetId] = useState<string>('baseline');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Compute live simulation calculations whenever params change
  const simulationResult = useMemo(() => {
    return runBusinessSimulation(params);
  }, [params]);

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setParams({ ...preset.params });
    setActivePresetId(preset.id);
  };

  const handleParamsChange = (newParams: SimulationParameters) => {
    setParams(newParams);
    setActivePresetId('custom');
  };

  const handleReset = () => {
    setParams({ ...DEFAULT_PARAMETERS });
    setActivePresetId('baseline');
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'reports') {
            setIsReportModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        simulationResult={simulationResult}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <Header
          simulationResult={simulationResult}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          onReset={handleReset}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenAI={() => setCurrentTab('chat')}
        />

        {/* Mobile Tab Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-b border-slate-800 bg-slate-950 px-2 py-2 overflow-x-auto text-xs">
          {[
            { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'simulator' as NavTab, label: 'Simulator', icon: SlidersHorizontal },
            { id: 'constraints' as NavTab, label: 'Constraints', icon: ShieldAlert },
            { id: 'chat' as NavTab, label: 'AI Analyst', icon: Bot },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: LIVE DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Welcome & Live Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800/90 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 backdrop-blur-md">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    OmniSim Executive Cockpit
                    <Badge variant="outline" className="text-xs font-mono border-indigo-500/30 text-indigo-300">
                      Apex Dynamics Corp
                    </Badge>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulating strategic operational consequence of demand variations against factory, staff, buffer, and carrier limits.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTab('simulator')}
                    className="text-xs h-8 gap-1.5 border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 text-slate-200"
                  >
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Adjust Levers</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCurrentTab('chat')}
                    className="text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Scenario Prompt</span>
                  </Button>
                </div>
              </div>

              {/* 1. Top Row: Metric Summary Cards */}
              <MetricSummaryCards simulationResult={simulationResult} />

              {/* 2. Constraint Health Meters (Gauges/Progress Bars) */}
              <ConstraintHealthGauges
                simulationResult={simulationResult}
                onNavigateToConstraints={() => setCurrentTab('constraints')}
              />

              {/* 3. Dynamic Charts: Dual-Axis Trend Chart & Resource Gap Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DualAxisTrendChart simulationResult={simulationResult} />
                <ResourceGapChart simulationResult={simulationResult} />
              </div>

              {/* 4. Bottom Row: Feasibility Radar Chart & Live Assistant Split Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FeasibilityRadarChart simulationResult={simulationResult} />
                </div>

                {/* Embedded Quick AI Scenario Box */}
                <div className="lg:col-span-2">
                  <Card className="border-slate-800/90 bg-slate-900/60 backdrop-blur-md h-full flex flex-col justify-between">
                    <CardHeader className="pb-3 border-b border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Bot className="h-4 w-4 text-indigo-400" />
                          AI Scenario Quick Intelligence
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentTab('chat')}
                          className="h-7 text-xs text-indigo-400 hover:text-indigo-300 gap-1 p-0"
                        >
                          <span>Open Full Console</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                      {/* Active AI Verdict */}
                      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">
                            Current Strategic Viability Assessment
                          </span>
                          <Badge
                            variant={
                              simulationResult.feasibilityScore >= 80
                                ? 'success'
                                : simulationResult.feasibilityScore >= 60
                                ? 'warning'
                                : 'destructive'
                            }
                            className="font-mono text-[10px]"
                          >
                            {simulationResult.feasibilityScore}% Feasible
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {simulationResult.feasibilityScore >= 80
                            ? 'The enterprise can fulfill this operational plan without exceeding baseline capacity thresholds. Operating margin is sustained.'
                            : simulationResult.feasibilityScore >= 60
                            ? 'Operations will experience moderate strain. Worker overtime and expedited shipping will cause margin compression without proactive mitigation.'
                            : 'Severe bottleneck risk detected! Assembly line queue and warehouse delays will lead to customer delivery backlogs.'}
                        </p>
                      </div>

                      {/* Quick Scenario Chips */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Instant Strategy Stress Tests
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => {
                              handleParamsChange({
                                ...params,
                                salesGrowth: 20,
                                headcountDelta: 0,
                                shiftCount: 2,
                              });
                            }}
                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 text-left transition-colors flex items-center justify-between group"
                          >
                            <span className="text-slate-300 group-hover:text-white">+20% Sales (Freeze Hiring)</span>
                            <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                          </button>

                          <button
                            onClick={() => {
                              handleParamsChange({
                                ...params,
                                inventoryBufferDays: 14,
                                fleetCapacityDelta: -20,
                              });
                            }}
                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 text-left transition-colors flex items-center justify-between group"
                          >
                            <span className="text-slate-300 group-hover:text-white">Supply Chain Crunch (-35% Stock)</span>
                            <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                          </button>

                          <button
                            onClick={() => {
                              handleParamsChange({
                                ...params,
                                salesGrowth: 40,
                                shiftCount: 3,
                                thirdPartyLogisticsShare: 40,
                              });
                            }}
                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 text-left transition-colors flex items-center justify-between group"
                          >
                            <span className="text-slate-300 group-hover:text-white">3-Shift Surge Expansion (+40%)</span>
                            <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                          </button>

                          <button
                            onClick={() => {
                              handleParamsChange({
                                ...params,
                                priceAdjustment: 8,
                                salesGrowth: 5,
                              });
                            }}
                            className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 text-left transition-colors flex items-center justify-between group"
                          >
                            <span className="text-slate-300 group-hover:text-white">Margin Optimization (+8% ASP)</span>
                            <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCENARIO BUILDER & MANUAL SLIDERS */}
          {currentTab === 'simulator' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  OmniSim Interactive Scenario Builder
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust commercial volume, production shift schedules, shopfloor headcount, inventory buffers, and logistics to simulate consequences in real time.
                </p>
              </div>

              <ScenarioControls
                params={params}
                onChange={handleParamsChange}
                simulationResult={simulationResult}
                onSelectPreset={handleSelectPreset}
                onReset={handleReset}
              />
            </div>
          )}

          {/* TAB 3: RESOURCE CONSTRAINTS DEEP DIVE */}
          {currentTab === 'constraints' && (
            <div className="animate-in fade-in duration-200">
              <ConstraintsDeepDive
                simulationResult={simulationResult}
                params={params}
                onUpdateParams={handleParamsChange}
              />
            </div>
          )}

          {/* TAB 4: AI SCENARIO ASSISTANT CONSOLE */}
          {currentTab === 'chat' && (
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 overflow-hidden shadow-2xl animate-in fade-in duration-200">
              <AIChatbotPanel
                currentParams={params}
                onApplyParams={handleParamsChange}
                isEmbedded={false}
              />
            </div>
          )}
        </main>
      </div>

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        simulationResult={simulationResult}
        params={params}
      />
    </div>
  );
}
