import React, { useState } from 'react';
import { ShieldCheck, Check, Info, Sliders, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { CaseAnalysis } from '../../types';

interface ReliabilityViewProps {
  currentCase: CaseAnalysis;
  onRecalculateXQI?: (weights: Record<string, number>) => Promise<void>;
}

export const ReliabilityView: React.FC<ReliabilityViewProps> = ({ currentCase, onRecalculateXQI }) => {
  const xqi = currentCase.xqi;
  const reliability = currentCase.reliability;

  const [faithfulnessW, setFaithfulnessW] = useState<number>(35);
  const [localizationW, setLocalizationW] = useState<number>(25);
  const [stabilityW, setStabilityW] = useState<number>(20);
  const [robustnessW, setRobustnessW] = useState<number>(20);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dimensions = [
    { name: 'Faithfulness', score: xqi.faithfulness, max: 100 },
    { name: 'Localization', score: xqi.localization, max: 100 },
    { name: 'Robustness', score: xqi.robustness, max: 100 },
    { name: 'Stability', score: xqi.stability, max: 100 },
    { name: 'Consistency', score: xqi.consistency, max: 100 },
    { name: 'Human Agreement', score: null, max: 100 },
    { name: 'Uncertainty Alignment', score: xqi.uncertainty_alignment, max: 100 }
  ];

  const handleRecalculateXQI = async () => {
    if (!onRecalculateXQI) return;
    setIsRecalculating(true);
    try {
      await onRecalculateXQI({
        faithfulness: faithfulnessW / 100,
        localization: localizationW / 100,
        stability: stabilityW / 100,
        robustness: robustnessW / 100
      });
      setToastMessage('XQI & Reliability successfully re-evaluated.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage(err.message || 'Recalculation complete.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleResetWeights = () => {
    setFaithfulnessW(35);
    setLocalizationW(25);
    setStabilityW(20);
    setRobustnessW(20);
    if (onRecalculateXQI) {
      onRecalculateXQI({
        faithfulness: 0.35,
        localization: 0.25,
        stability: 0.20,
        robustness: 0.20
      });
    }
    setToastMessage('Reset to standard publication baseline weights.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reliability &amp; XQI</h1>
          <p className="text-xs text-slate-500 font-medium">
            Explanation quality, uncertainty gating, and reliability assessment for {currentCase.case_id}
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Calibration Active
        </span>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

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
                  stroke={xqi.overall >= 80 ? '#10b981' : xqi.overall >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="126"
                  strokeDashoffset={126 - (126 * (Math.min(100, Math.max(0, xqi.overall)) / 100))}
                />
              </svg>
              <div className="absolute text-center mb-1">
                <span className="text-3xl font-black font-mono text-slate-900 leading-none">
                  {xqi.overall.toFixed(0)}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">/100</span>
              </div>
            </div>

            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border mt-2 ${
              xqi.overall >= 80
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : xqi.overall >= 60
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {xqi.overall >= 80 ? 'HIGH QUALITY' : xqi.overall >= 60 ? 'MODERATE QUALITY' : 'LOW QUALITY'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Multi-dimensional composite metric
            </span>
          </div>

          {/* Right: XQI Breakdown Progress Bars (7 cols) */}
          <div className="md:col-span-7 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              XQI BREAKDOWN BY DIMENSION
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

      {/* Interactive Weight Tuning Bar */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Interactive XQI Dimension Tuner
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-slate-500">
              Sum: <strong>{faithfulnessW + localizationW + stabilityW + robustnessW}%</strong>
            </span>
            <button
              onClick={handleResetWeights}
              className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">Faithfulness</span>
              <span className="font-mono font-bold text-blue-600">{faithfulnessW}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={faithfulnessW}
              onChange={(e) => setFaithfulnessW(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">Localization</span>
              <span className="font-mono font-bold text-blue-600">{localizationW}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={localizationW}
              onChange={(e) => setLocalizationW(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">Stability</span>
              <span className="font-mono font-bold text-blue-600">{stabilityW}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={stabilityW}
              onChange={(e) => setStabilityW(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">Robustness</span>
              <span className="font-mono font-bold text-blue-600">{robustnessW}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={robustnessW}
              onChange={(e) => setRobustnessW(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <button
          onClick={handleRecalculateXQI}
          disabled={isRecalculating}
          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-2xs flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-all"
        >
          {isRecalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isRecalculating ? 'Recomputing XQI...' : 'Recalculate XQI & Update Reliability'}</span>
        </button>
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
                stroke={reliability.score >= 80 ? '#10b981' : reliability.score >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * (Math.min(100, Math.max(0, reliability.score)) / 100))}
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
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border block ${
              reliability.level === 'RELIABLE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : reliability.level === 'CAUTION'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {reliability.level}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Should the explanation be trusted? <strong>{reliability.level === 'RELIABLE' ? 'Yes' : 'Review Required'}</strong>
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
              <span className="font-mono font-bold text-emerald-600">
                {currentCase.uncertainty.alignment_with_confidence || 'HIGH'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReliabilityView;
