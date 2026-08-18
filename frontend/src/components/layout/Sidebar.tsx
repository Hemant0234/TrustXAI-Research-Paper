import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  Layers,
  ShieldCheck,
  Sliders,
  Globe2,
  TestTubes,
  Stethoscope,
  FileText,
  Database,
  Cpu,
  Settings,
  Shield
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'analyze'
  | 'explanation-lab'
  | 'fusion-lab'
  | 'reliability'
  | 'robustness'
  | 'validation'
  | 'experiments'
  | 'clinical-study'
  | 'reports'
  | 'datasets'
  | 'models'
  | 'settings';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const navItems = [
    { id: 'overview' as NavView, label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze' as NavView, label: 'Analyze Case', icon: ScanEye },
    { id: 'explanation-lab' as NavView, label: 'Explanation Lab', icon: Layers },
    { id: 'fusion-lab' as NavView, label: 'Fusion Lab', icon: Layers },
    { id: 'reliability' as NavView, label: 'Reliability (XQI)', icon: ShieldCheck },
    { id: 'robustness' as NavView, label: 'Robustness Lab', icon: Sliders },
    { id: 'validation' as NavView, label: 'Validation', icon: Globe2 },
    { id: 'experiments' as NavView, label: 'Experiments', icon: TestTubes },
    { id: 'clinical-study' as NavView, label: 'Clinical Study', icon: Stethoscope },
    { id: 'reports' as NavView, label: 'Reports', icon: FileText },
    { id: 'datasets' as NavView, label: 'Datasets', icon: Database },
    { id: 'models' as NavView, label: 'Models', icon: Cpu },
    { id: 'settings' as NavView, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#0a101d] text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-[#152033]">
      <div>
        {/* Brand Header */}
        <div className="px-4 py-4 border-b border-[#152033] flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-wider font-mono">
              TRUSTXAI-MED
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">
              Uncertainty-Aware Hybrid XAI
            </div>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-left text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-[#131d2e] hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Version and Health */}
      <div className="p-3 border-t border-[#152033] text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Research Prototype</span>
          <span className="text-emerald-400 font-mono">v1.0.0</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>System Healthy</span>
        </div>
      </div>
    </aside>
  );
};
