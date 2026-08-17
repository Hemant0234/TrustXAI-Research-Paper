import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  Layers,
  ShieldAlert,
  Sliders,
  Globe2,
  TestTubes,
  UserCheck,
  FileText,
  Settings,
  HelpCircle,
  Stethoscope
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'analyze'
  | 'fusion'
  | 'reliability'
  | 'robustness'
  | 'validation'
  | 'experiments'
  | 'clinical-study'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
}

interface NavItem {
  id: NavView;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const primaryNavItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      sublabel: 'Research KPIs & Cases',
      icon: LayoutDashboard,
    },
    {
      id: 'analyze',
      label: 'Analyze Case',
      sublabel: 'Primary Command Center',
      icon: ScanEye,
      badge: 'Core',
    },
    {
      id: 'fusion',
      label: 'Explanation Lab',
      sublabel: 'Multi-XAI & Spatial Fusion',
      icon: Layers,
    },
    {
      id: 'reliability',
      label: 'Reliability / XQI',
      sublabel: '7-D Quality & Trust Score',
      icon: ShieldAlert,
    },
    {
      id: 'robustness',
      label: 'Robustness Lab',
      sublabel: 'Perturbation Stability',
      icon: Sliders,
    },
    {
      id: 'validation',
      label: 'Validation Lab',
      sublabel: 'Cross-Domain Generalization',
      icon: Globe2,
    },
    {
      id: 'experiments',
      label: 'Experiments & Ablation',
      sublabel: 'Benchmark Comparison Matrix',
      icon: TestTubes,
    },
    {
      id: 'clinical-study',
      label: 'Clinical Trust Study',
      sublabel: '4-Condition Reader Protocol',
      icon: Stethoscope,
      badge: 'A/B/C/D',
    },
    {
      id: 'reports',
      label: 'Research Reports',
      sublabel: 'Audit Dossier & Exports',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-clinical-900 text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-clinical-800">
      <div>
        {/* Brand identity sub-header */}
        <div className="p-5 border-b border-clinical-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Clinical Command Center
            </span>
          </div>
          <div className="mt-1 text-sm font-bold text-white tracking-tight">
            TrustXAI Architecture
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:bg-clinical-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <div className="truncate">
                    <div className="text-xs font-semibold leading-tight">{item.label}</div>
                    {item.sublabel && (
                      <div className={`text-[10px] leading-tight truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-clinical-800 text-slate-300 border border-clinical-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom system status & Settings */}
      <div className="p-3 border-t border-clinical-800 space-y-2">
        <button
          onClick={() => onSelectView('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
            activeView === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-clinical-800 hover:text-white text-xs'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-xs font-semibold">Settings & Methodology</div>
            <div className="text-[10px] text-slate-400">Architecture & Pipeline</div>
          </div>
        </button>

        {/* Live System Health Badge */}
        <div className="bg-clinical-950/60 p-3 rounded-lg border border-clinical-800/80 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span>Research Mode</span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span>Model Backend</span>
            <span className="text-blue-400 font-semibold">FastAPI + Torch</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span>Datasets</span>
            <span className="text-slate-300">CheXpert / ISIC / BraTS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
