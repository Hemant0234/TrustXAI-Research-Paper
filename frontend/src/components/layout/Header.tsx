import React from 'react';
import { ShieldCheck, Activity, Database, Cpu, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentCaseId?: string;
  modality?: string;
  isDemoMode: boolean;
  onToggleDemoMode?: () => void;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCaseId = 'TX-2048',
  modality = 'Chest X-Ray',
  isDemoMode = true,
  onToggleDemoMode,
  onRefresh
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-clinical-200 px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Logo & Product Title */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-clinical-900 text-white shadow-sm border border-clinical-700">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-clinical-900 tracking-tight">TrustXAI-Med</span>
              <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                v1.0-research
              </span>
              {isDemoMode && (
                <span className="text-xs px-2 py-0.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> DEMO SIMULATED DATA
                </span>
              )}
            </div>
            <p className="text-xs text-clinical-500 font-medium">
              Uncertainty-Aware Hybrid XAI for Medical Image Diagnosis
            </p>
          </div>
        </div>

        {/* Live Clinical Telemetry & Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4 px-3.5 py-1.5 rounded-lg bg-clinical-50 border border-clinical-200 text-xs">
            <div className="flex items-center space-x-1.5 text-clinical-600">
              <Cpu className="w-3.5 h-3.5 text-clinical-500" />
              <span className="text-clinical-500">Model:</span>
              <span className="font-semibold text-clinical-800">DenseNet-121</span>
            </div>
            <div className="h-3 w-px bg-clinical-200" />
            <div className="flex items-center space-x-1.5 text-clinical-600">
              <Database className="w-3.5 h-3.5 text-clinical-500" />
              <span className="text-clinical-500">Core Benchmark:</span>
              <span className="font-semibold text-clinical-800">CheXpert + CheXlocalize</span>
            </div>
            <div className="h-3 w-px bg-clinical-200" />
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-emerald-700">Pipeline Ready</span>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-clinical-600 hover:text-clinical-900 bg-clinical-100 hover:bg-clinical-200 rounded-lg transition-colors border border-clinical-200"
              title="Refresh case state"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Research Disclaimer Pill */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            <span>Research Prototype • Not for Clinical Diagnosis</span>
          </div>
        </div>
      </div>
    </header>
  );
};
