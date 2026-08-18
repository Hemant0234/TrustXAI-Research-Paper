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
  Shield,
  Sparkles,
  ChevronRight
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

interface NavGroup {
  title: string;
  items: {
    id: NavView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const navGroups: NavGroup[] = [
    {
      title: 'CLINICAL WORKSPACE',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analyze', label: 'Analyze Case', icon: ScanEye },
        { id: 'reports', label: 'Reports & Export', icon: FileText }
      ]
    },
    {
      title: 'XAI & RELIABILITY LABS',
      items: [
        { id: 'explanation-lab', label: 'Explanation Lab', icon: Layers },
        { id: 'fusion-lab', label: 'Fusion Lab', icon: Sparkles },
        { id: 'reliability', label: 'Reliability (XQI)', icon: ShieldCheck },
        { id: 'robustness', label: 'Robustness Lab', icon: Sliders }
      ]
    },
    {
      title: 'VALIDATION & CLINICAL',
      items: [
        { id: 'validation', label: 'Validation Cohorts', icon: Globe2 },
        { id: 'experiments', label: 'Experiments', icon: TestTubes },
        { id: 'clinical-study', label: 'Clinical Study', icon: Stethoscope }
      ]
    },
    {
      title: 'SYSTEM & REGISTRY',
      items: [
        { id: 'datasets', label: 'Datasets Registry', icon: Database },
        { id: 'models', label: 'Models & Training', icon: Cpu },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-[#080e1a] text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-[#152033] h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#152033] flex items-center space-x-3 bg-gradient-to-b from-[#0e172a] to-[#080e1a]">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-wider font-mono">
              TRUSTXAI-MED
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">
              Clinical Precision XAI
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-2 text-[9px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectView(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:bg-[#121c2d] hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Health & Version */}
      <div className="p-3 border-t border-[#152033] bg-[#060b14] text-[10px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between font-medium">
          <span className="text-slate-400">Research Platform</span>
          <span className="text-blue-400 font-mono font-bold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
            v1.0.0
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PyTorch Engine Online</span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
