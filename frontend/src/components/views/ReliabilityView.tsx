import React from 'react';
import { ShieldCheck, Check, Info } from 'lucide-react';
import { CaseAnalysis } from '../../types';

interface ReliabilityViewProps {
  currentCase: CaseAnalysis;
  onRecalculateXQI?: (weights: Record<string, number>) => Promise<void>;
}

export const ReliabilityView: React.FC<ReliabilityViewProps> = ({ currentCase }) => {
  const xqi = currentCase.xqi;
  const reliability = currentCase.reliability;

  const dimensions = [
    { name: 'Faithfulness', score: xqi.faithfulness, max: 100 },
    { name: 'Localization', score: xqi.localization, max: 100 },
    { name: 'Robustness', score: xqi.robustness, max: 100 },
    { name: 'Stability', score: xqi.stability, max: 100 },
    { name: 'Consistency', score: xqi.consistency, max: 100 },
    { name: 'Human Agreement', score: null, max: 100 },
    { name: 'Uncertainty Alignment', score: xqi.uncertainty_alignment, max: 100 }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reliability &amp; XQI</h1>
          <p className="text-xs text-slate-500 font-medium">
            Explanation quality and reliability assessment
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Demo Mode
        </span>
      </div>

      {/* Top Section: Explanation Quality Index (XQI) Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          EXPLANATION QUALITY INDEX (XQI)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Semi-circular Gauge (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="w-48 h-28 relative flex items-end justify-center">
              <svg viewBox="0 0 100 55" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Colored arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="126"
                  strokeDashoffset={126 - (126 * (xqi.overall / 100))}
                />
              </svg>
              <div className="absolute text-center mb-1">
                <span className="text-3xl font-black font-mono text-slate-900 leading-none">
                  {xqi.overall.toFixed(0)}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">/100</span>
              </div>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2">
              HIGH QUALITY
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Research baseline assessment
            </span>
          </div>

          {/* Right: XQI Breakdown Progress Bars (7 cols) */}
          <div className="md:col-span-7 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              XQI BREAKDOWN
            </div>

            <div className="space-y-1.5 text-xs">
              {dimensions.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-4">
                  <span className="w-36 text-slate-600 font-medium truncate">{d.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.score !== null ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${d.score !== null ? d.score : 0}%` }}
                    />
                  </div>
                  <span className="w-14 text-right font-mono font-bold text-slate-800 text-[11px]">
                    {d.score !== null ? `${d.score.toFixed(0)}/100` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Reliability Semi-gauge, Evidence Checklist, and Uncertainty Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Explanation Reliability */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2 flex flex-col items-center justify-between text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-full text-left">
            EXPLANATION RELIABILITY
          </div>

          <div className="w-36 h-20 relative flex items-end justify-center">
            <svg viewBox="0 0 100 55" className="w-full h-full">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * (reliability.score / 100))}
              />
            </svg>
            <div className="absolute text-center mb-0.5">
              <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                {reliability.score.toFixed(0)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">/100</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 block">
              HIGH RELIABILITY
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Should the explanation be trusted? <strong>Yes</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Reliability Evidence Checklist */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            RELIABILITY EVIDENCE
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>High cross-method agreement</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Strong localization (matches annotations)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Stable under perturbations</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Low prediction uncertainty</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>High faithfulness score</span>
            </div>
          </div>
        </div>

        {/* Card 3: Uncertainty -> Explanation Reliability */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            UNCERTAINTY → EXPLANATION RELIABILITY
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Prediction Confidence</span>
              <span className="font-mono font-bold text-slate-900">
                {(currentCase.prediction.probability * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Prediction Uncertainty</span>
              <span className="font-mono font-bold text-emerald-600 uppercase">
                {currentCase.uncertainty.level}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Explanation Reliability</span>
              <span className="font-mono font-bold text-slate-900">
                {reliability.score.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Alignment</span>
              <span className="font-mono font-bold text-emerald-600">HIGH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-[10px] text-slate-400">
        XQI weights are configurable and require empirical validation.
      </div>
    </div>
  );
};
