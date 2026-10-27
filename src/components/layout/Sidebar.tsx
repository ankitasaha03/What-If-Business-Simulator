import React from 'react';
import {
  LayoutDashboard,
  SlidersHorizontal,
  ShieldAlert,
  Bot,
  FileText,
  Cpu,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SimulationResult } from '@/lib/types';
import { formatCurrency } from '@/lib/simulationEngine';

export type NavTab = 'dashboard' | 'simulator' | 'constraints' | 'chat' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  simulationResult: SimulationResult;
}

export function Sidebar({ currentTab, onTabChange, simulationResult }: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Live Dashboard',
      icon: LayoutDashboard,
      badge: 'Real-time',
    },
    {
      id: 'simulator' as NavTab,
      label: 'Scenario Builder',
      icon: SlidersHorizontal,
      badge: null,
    },
    {
      id: 'constraints' as NavTab,
      label: 'Resource Constraints',
      icon: ShieldAlert,
      badge: simulationResult.bottlenecks.length > 1 ? `${simulationResult.bottlenecks.length} Risks` : null,
      badgeVariant: simulationResult.feasibilityScore < 65 ? 'destructive' : 'warning',
    },
    {
      id: 'chat' as NavTab,
      label: 'AI Scenario Analyst',
      icon: Bot,
      badge: 'GPT-4o Sim',
    },
    {
      id: 'reports' as NavTab,
      label: 'Executive Reports',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/90 bg-slate-950 flex flex-col justify-between hidden md:flex">
      {/* Top: Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 shadow-md shadow-indigo-500/20 text-white">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white text-base">
              Omni<span className="text-indigo-400">Sim</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              What-If Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Executive Controls
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <Badge
                      variant={(item.badgeVariant as any) || 'secondary'}
                      className="text-[10px] py-0 px-1.5 h-4 font-mono"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-3 w-3 text-indigo-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Real-Time Simulation Mini Gauge & Enterprise Tag */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 m-3 rounded-xl border">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Scenario Feasibility</span>
          <span
            className={`font-mono font-bold ${
              simulationResult.feasibilityScore >= 80
                ? 'text-emerald-400'
                : simulationResult.feasibilityScore >= 60
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {simulationResult.feasibilityScore}%
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50 mb-3">
          <div
            className={`h-full transition-all duration-500 ${
              simulationResult.feasibilityScore >= 80
                ? 'bg-emerald-500'
                : simulationResult.feasibilityScore >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${simulationResult.feasibilityScore}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-indigo-400" />
            <span>Proj. Rev</span>
          </div>
          <span className="font-mono text-slate-200 font-semibold">
            {formatCurrency(simulationResult.simulatedRevenue)}
          </span>
        </div>

        <div className="mt-3 pt-2 text-[10px] text-slate-500 font-mono text-center">
          OmniSim Engine • v2.4 Enterprise
        </div>
      </div>
    </aside>
  );
}
