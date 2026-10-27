import React from 'react';
import {
  Activity,
  RotateCcw,
  FileDown,
  Sparkles,
  Layers,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationResult, ScenarioPreset } from '@/lib/types';
import { SCENARIO_PRESETS } from '@/lib/simulationEngine';

interface HeaderProps {
  simulationResult: SimulationResult;
  activePresetId: string;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onReset: () => void;
  onOpenReport: () => void;
  onOpenAI: () => void;
}

export function Header({
  simulationResult,
  activePresetId,
  onSelectPreset,
  onReset,
  onOpenReport,
  onOpenAI,
}: HeaderProps) {
  const [presetDropdownOpen, setPresetDropdownOpen] = React.useState(false);
  const activePreset = SCENARIO_PRESETS.find((p) => p.id === activePresetId);

  const getHealthBadge = () => {
    switch (simulationResult.systemHealthStatus) {
      case 'Optimal':
        return (
          <Badge variant="success" className="gap-1.5 py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Optimal Health ({simulationResult.feasibilityScore}%)</span>
          </Badge>
        );
      case 'Manageable Strain':
        return (
          <Badge variant="warning" className="gap-1.5 py-1 px-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Manageable Strain ({simulationResult.feasibilityScore}%)</span>
          </Badge>
        );
      case 'Severe Bottleneck':
        return (
          <Badge variant="destructive" className="gap-1.5 py-1 px-3 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">Severe Bottleneck ({simulationResult.feasibilityScore}%)</span>
          </Badge>
        );
      case 'Critical Failure':
        return (
          <Badge variant="destructive" className="gap-1.5 py-1 px-3 bg-red-950/80 border-red-500 text-red-200 animate-bounce">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span className="font-semibold">Critical Failure ({simulationResult.feasibilityScore}%)</span>
          </Badge>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6">
      {/* Left section: Active Simulation status & Preset switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                simulationResult.feasibilityScore >= 80
                  ? 'bg-emerald-400'
                  : simulationResult.feasibilityScore >= 60
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                simulationResult.feasibilityScore >= 80
                  ? 'bg-emerald-500'
                  : simulationResult.feasibilityScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 hidden sm:inline-block">
            Simulation Status:
          </span>
          {getHealthBadge()}
        </div>

        {/* Preset Selector Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className="gap-2 text-xs border-slate-700 bg-slate-900/90 text-slate-200"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span className="max-w-[130px] truncate">
              {activePreset ? activePreset.name : 'Custom Scenario'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Button>

          {presetDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Strategic Scenario Presets
              </div>
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    setPresetDropdownOpen(false);
                  }}
                  className={`w-full text-left rounded-lg p-2.5 transition-colors text-xs flex flex-col gap-0.5 ${
                    activePresetId === preset.id
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{preset.name}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {preset.tag}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAI}
          className="gap-1.5 text-xs border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/50 text-indigo-200"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin-slow" />
          <span className="hidden sm:inline">AI Scenario Analyst</span>
          <span className="sm:hidden">AI</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onReset}
          className="gap-1.5 text-xs text-slate-300 hover:text-white"
          title="Reset to Baseline"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Reset Defaults</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onOpenReport}
          className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span>Export Report</span>
        </Button>
      </div>
    </header>
  );
}
