import React from 'react';
import { TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { CaseSummary } from '../../types';

interface OverviewViewProps {
  cases: CaseSummary[];
  onSelectCase: (caseId: string) => void;
  onNavigateToAnalyze: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  cases,
  onSelectCase,
  onNavigateToAnalyze
}) => {
  const recentCases = [
    {
      id: 'TX-2048',
      dataset: 'CheXpert',
      modality: 'Chest X-Ray',
      prediction: 'Pneumonia',
      confidence: '91.4%',
      uncertainty: 'Low',
      uncColor: 'text-emerald-600',
      xqi: 87,
      reliability: 92,
      status: 'RELIABLE',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      date: 'May 12, 2026'
    },
    {
      id: 'TX-2047',
      dataset: 'CheXpert',
      modality: 'Chest X-Ray',
      prediction: 'Cardiomegaly',
      confidence: '74.2%',
      uncertainty: 'Moderate',
      uncColor: 'text-amber-600',
      xqi: 58,
      reliability: 61,
      status: 'CAUTION',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
      date: 'May 12, 2026'
    },
    {
      id: 'TX-3046',
      dataset: 'ISIC',
      modality: 'Dermoscopy',
      prediction: 'Melanoma',
      confidence: '68.1%',
      uncertainty: 'High',
      uncColor: 'text-rose-600',
      xqi: 52,
      reliability: 48,
      status: 'REVIEW',
      statusClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      date: 'May 11, 2026'
    },
    {
      id: 'TX-2045',
      dataset: 'BraTS',
      modality: 'Brain MRI',
      prediction: 'Glioma',
      confidence: '83.7%',
      uncertainty: 'Low',
      uncColor: 'text-emerald-600',
      xqi: 79,
      reliability: 84,
      status: 'RELIABLE',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      date: 'May 11, 2026'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 font-medium">
            Research dashboard for trustworthy medical AI explanations
          </p>
        </div>
      </div>

      {/* Row 1: Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Model Accuracy */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MODEL ACCURACY
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">92.41%</span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2.31% <span className="text-slate-400 ml-1 font-normal">vs last 30d</span>
            </span>
          </div>
        </div>

        {/* Calibration ECE */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            CALIBRATION (ECE)
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">0.08</span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -0.02 <span className="text-slate-400 ml-1 font-normal">vs last 30d</span>
            </span>
          </div>
        </div>

        {/* Mean XQI */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MEAN XQI
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              81<span className="text-sm font-normal text-slate-400">/100</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +5 <span className="text-slate-400 ml-1 font-normal">vs last 30d</span>
            </span>
          </div>
        </div>

        {/* Explanation Reliability */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            EXPLANATION RELIABILITY
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              86<span className="text-sm font-normal text-slate-400">/100</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +7 <span className="text-slate-400 ml-1 font-normal">vs last 30d</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Telemetry & 2 Donut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Uncertainty Alignment */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            UNCERTAINTY ALIGNMENT
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">0.88</span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.06 <span className="text-slate-400 ml-1 font-normal">vs last 30d</span>
            </span>
          </div>
        </div>

        {/* Cases Analyzed */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            CASES ANALYZED
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">1,248</span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +128 <span className="text-slate-400 ml-1 font-normal">vs last 30d</span>
            </span>
          </div>
        </div>

        {/* Cases by Dataset (Donut Chart) */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              CASES BY DATASET
            </div>
            <div className="space-y-0.5 text-[10px] text-slate-600 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>CheXpert (52%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>ISIC (24%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>BraTS (16%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>VinDr-CXR (8%)</span>
              </div>
            </div>
          </div>
          {/* SVG Donut */}
          <div className="w-16 h-16 relative shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="52 48" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="24 76" strokeDashoffset="-52" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="16 84" strokeDashoffset="-76" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="8 92" strokeDashoffset="-92" />
            </svg>
          </div>
        </div>

        {/* Reliability Distribution (Donut Chart) */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              RELIABILITY DISTRIBUTION
            </div>
            <div className="space-y-0.5 text-[10px] text-slate-600 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Reliable [80-100] (64%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Caution [60-80] (24%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Review [&lt;60] (12%)</span>
              </div>
            </div>
          </div>
          {/* SVG Donut */}
          <div className="w-16 h-16 relative shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="64 36" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="24 76" strokeDashoffset="-64" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="12 88" strokeDashoffset="-88" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Cases Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recent Cases
          </h2>
          <button
            onClick={onNavigateToAnalyze}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Analyze New Case</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Dataset</th>
                <th className="py-2.5 px-3">Modality</th>
                <th className="py-2.5 px-3">Prediction</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Uncertainty</th>
                <th className="py-2.5 px-3">XQI</th>
                <th className="py-2.5 px-3">Reliability</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
              {recentCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-blue-600 font-mono">
                    {c.id}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{c.dataset}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{c.modality}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    {c.prediction}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{c.confidence}</td>
                  <td className={`py-2.5 px-3 font-sans font-semibold ${c.uncColor}`}>
                    {c.uncertainty}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{c.xqi}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{c.reliability}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.statusClass}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span><strong>Model:</strong> DenseNet-121</span>
          <span>•</span>
          <span><strong>Dataset:</strong> CheXpert (v1.0)</span>
          <span>•</span>
          <span><strong>Last Updated:</strong> May 12, 2026 10:54 AM</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>System Health: Healthy</span>
        </div>
      </div>
    </div>
  );
};
