import React from 'react';
import { Shield, Activity, Database, Cpu, AlertTriangle, Sparkles, Stethoscope, ChevronRight } from 'lucide-react';
import { CaseSummary } from '../../types';

interface HeaderProps {
  selectedCaseId?: string;
  onSelectCase?: (caseId: string) => void;
  cases?: CaseSummary[];
  isDemoMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCaseId = 'TX-2048',
  onSelectCase,
  cases = [],
  isDemoMode = true
}) => {
  const currentCase = cases.find((c) => c.case_id === selectedCaseId) || cases[0];

  return (
    <header className="bg-white border-b border-slate-200/90 px-6 py-2.5 flex items-center justify-between select-none sticky top-0 z-30 shadow-2xs">
      {/* Left Active Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-lg font-mono text-xs font-bold shadow-2xs">
            <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
            <span>CASE: {selectedCaseId}</span>
          </div>
          {currentCase && (
            <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {currentCase.modality} • {currentCase.predicted_label} ({currentCase.confidence}%)
            </span>
          )}
        </div>
      </div>

      {/* Center/Right Telemetry */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Model & Dataset Pill */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>DenseNet-121</span>
          <span className="text-slate-300">|</span>
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>CheXpert Benchmark</span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Calibrated Engine</span>
        </div>

        {/* Disclaimer Pill */}
        <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Research Prototype</span>
        </div>
      </div>
    </header>
  );
};
export default Header;
