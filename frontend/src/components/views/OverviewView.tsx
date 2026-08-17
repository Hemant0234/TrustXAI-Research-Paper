import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Percent,
  Sliders,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  Layers
} from 'lucide-react';
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RELIABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CAUTION':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REVIEW REQUIRED':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Medical XAI Research Platform
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
            TrustXAI-Med — Uncertainty-Aware Hybrid XAI
          </h1>
          <p className="text-sm text-clinical-600 font-medium mt-1 max-w-2xl">
            Evaluate whether an AI prediction — and the explanation behind it — deserves to be trusted.
            Operationalizing multi-XAI fusion, 7-dimensional explanation quality (XQI), and clinical reliability gating.
          </p>
        </div>

        <button
          onClick={onNavigateToAnalyze}
          className="px-4 py-2.5 rounded-xl bg-clinical-900 hover:bg-black text-white font-semibold text-xs flex items-center space-x-2 transition-all shrink-0 shadow-sm"
        >
          <span>Open Case Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Model Accuracy */}
        <div className="bg-white rounded-xl border border-clinical-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-500 block">
            Model Accuracy
          </span>
          <div className="text-2xl font-extrabold font-mono text-clinical-900">88.4%</div>
          <span className="text-[10px] text-clinical-500 font-medium block">CheXpert DenseNet-121</span>
        </div>

        {/* Calibration ECE */}
        <div className="bg-white rounded-xl border border-clinical-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-500 block">
            Calibration (ECE)
          </span>
          <div className="text-2xl font-extrabold font-mono text-blue-600">0.045</div>
          <span className="text-[10px] text-emerald-600 font-medium block">Well-Calibrated</span>
        </div>

        {/* Mean XQI */}
        <div className="bg-white rounded-xl border border-clinical-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-500 block">
            Mean XQI
          </span>
          <div className="text-2xl font-extrabold font-mono text-clinical-900">87.6<span className="text-xs text-clinical-400 font-normal">/100</span></div>
          <span className="text-[10px] text-clinical-500 font-medium block">7-Dimension Metric</span>
        </div>

        {/* Explanation Reliability */}
        <div className="bg-white rounded-xl border border-clinical-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-500 block">
            Reliability
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-600">92.1<span className="text-xs text-clinical-400 font-normal">/100</span></div>
          <span className="text-[10px] text-emerald-700 font-medium block">Multi-XAI Fused</span>
        </div>

        {/* Uncertainty Alignment */}
        <div className="bg-white rounded-xl border border-clinical-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-500 block">
            Alignment
          </span>
          <div className="text-2xl font-extrabold font-mono text-indigo-600">91.2%</div>
          <span className="text-[10px] text-clinical-500 font-medium block">Conf ↔ Uncertainty</span>
        </div>

        {/* Cases Analyzed */}
        <div className="bg-white rounded-xl border border-clinical-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-500 block">
            Cases Analyzed
          </span>
          <div className="text-2xl font-extrabold font-mono text-clinical-900">5</div>
          <span className="text-[10px] text-clinical-500 font-medium block">Benchmark Suite</span>
        </div>
      </div>

      {/* Killer Demo Case Highlight Callout */}
      <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-white rounded-xl border border-rose-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Central Research Investigation: High Confidence ≠ Trustworthy Explanation
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
            In standard systems, <strong>Case TX-2047</strong> displays <strong>93.2% confidence</strong> and a convincing heatmap.
            TrustXAI-Med identifies severe cross-explainer discordance, elevated predictive entropy, and instability, correctly flagging it as <strong>REVIEW REQUIRED (Reliability: 46/100)</strong>.
          </p>
        </div>
        <button
          onClick={() => onSelectCase('TX-2047')}
          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 shadow-2xs transition-colors"
        >
          Inspect Killer Demo (TX-2047)
        </button>
      </div>

      {/* Benchmark Research Cases Table */}
      <div className="bg-white rounded-xl border border-clinical-200 shadow-sm overflow-hidden space-y-0">
        <div className="px-5 py-4 border-b border-clinical-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-clinical-900 uppercase tracking-wider">
              Research Evaluation Cases
            </h2>
            <p className="text-xs text-clinical-500 font-medium">
              Representative clinical test cases spanning Chest Radiography, Dermoscopy, and Brain MRI
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-clinical-700">
            <thead className="bg-clinical-50/80 text-clinical-600 border-b border-clinical-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Predicted Diagnosis</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Uncertainty</th>
                <th className="py-3 px-4">XQI Score</th>
                <th className="py-3 px-4">Reliability</th>
                <th className="py-3 px-4">Research Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-100 font-medium">
              {cases.map((c) => (
                <tr
                  key={c.case_id}
                  onClick={() => onSelectCase(c.case_id)}
                  className="hover:bg-clinical-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-clinical-900">
                    {c.case_id}
                  </td>
                  <td className="py-3 px-4 text-clinical-600">{c.modality}</td>
                  <td className="py-3 px-4 font-semibold text-clinical-900">
                    {c.predicted_label}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    {c.confidence.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-clinical-700 font-mono">
                      {c.uncertainty_level} ({c.uncertainty_score.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-clinical-900">
                    {c.xqi_score.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-clinical-900">
                    {c.reliability_score.toFixed(1)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase border ${getStatusBadge(
                        c.reliability_level
                      )}`}
                    >
                      {c.reliability_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c.case_id);
                      }}
                      className="px-2.5 py-1 rounded bg-clinical-100 hover:bg-clinical-200 text-clinical-800 text-[11px] font-semibold transition-colors"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
