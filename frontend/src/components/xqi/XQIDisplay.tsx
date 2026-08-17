import React, { useState } from 'react';
import { Award, ChevronDown, ChevronUp, Sliders, Info, ShieldCheck, RefreshCw } from 'lucide-react';
import { XQIDimensions } from '../../types';

interface XQIDisplayProps {
  xqi: XQIDimensions;
  onRecalculateWeights?: (weights: Record<string, number>) => void;
}

export const XQIDisplay: React.FC<XQIDisplayProps> = ({ xqi, onRecalculateWeights }) => {
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [showWeightSliders, setShowWeightSliders] = useState<boolean>(false);
  const [customWeights, setCustomWeights] = useState<Record<string, number>>(xqi.weights);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const getStatusBadge = (status: string) => {
    if (status.includes('HIGH')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (status.includes('MODERATE')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  const handleSliderChange = (dim: string, val: number) => {
    setCustomWeights((prev) => ({
      ...prev,
      [dim]: val
    }));
  };

  const handleApplyWeights = async () => {
    if (onRecalculateWeights) {
      setIsUpdating(true);
      await onRecalculateWeights(customWeights);
      setIsUpdating(false);
    }
  };

  const dimensions = [
    { key: 'faithfulness', label: 'Model Faithfulness', val: xqi.faithfulness, desc: 'Salience impact on output logits' },
    { key: 'localization', label: 'Clinical Localization', val: xqi.localization, desc: 'Overlap with expert radiologist masks' },
    { key: 'robustness', label: 'Perturbation Robustness', val: xqi.robustness, desc: 'Resistance to geometric & sensor noise' },
    { key: 'stability', label: 'Algorithmic Stability', val: xqi.stability, desc: 'Variance across repeated explainer runs' },
    { key: 'consistency', label: 'Cross-Method Consistency', val: xqi.consistency, desc: 'Spatial agreement with explainer ensemble' },
    { key: 'human_agreement', label: 'Human Agreement', val: xqi.human_agreement, desc: 'Direct clinician reader study score' },
    { key: 'uncertainty_alignment', label: 'Uncertainty Alignment', val: xqi.uncertainty_alignment, desc: 'Coherence with predictive entropy' },
  ];

  return (
    <div className="bg-white rounded-xl border border-clinical-200 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-700 block">
              Explanation Quality Index (XQI)
            </span>
            <span className="text-[11px] text-clinical-500 font-medium">
              Multi-Dimensional Quantitative Quality Benchmark
            </span>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 font-bold uppercase rounded-full border ${getStatusBadge(
            xqi.status
          )}`}
        >
          {xqi.status}
        </span>
      </div>

      {/* Hero Score Display */}
      <div className="flex items-center justify-between bg-clinical-50/80 rounded-xl p-4 border border-clinical-100">
        <div>
          <span className="text-xs text-clinical-500 font-medium block">
            Composite Quality Index
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-clinical-900 tracking-tight font-mono">
              {xqi.overall.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-clinical-400 font-mono">/ 100</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-clinical-100 text-clinical-700 text-xs font-semibold border border-clinical-200 flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Weights</span>
          </button>
        </div>
      </div>

      {/* 7-Dimensional Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {dimensions.map((dim) => {
          const isNA = dim.val === null || dim.val === undefined;
          const weight = xqi.weights[dim.key] ?? 0;
          return (
            <div
              key={dim.key}
              className="p-2.5 rounded-lg bg-clinical-50/60 border border-clinical-100 space-y-1.5"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-clinical-700 truncate pr-1">
                  {dim.label}
                </span>
                <span
                  className={`font-mono font-bold text-xs ${
                    isNA
                      ? 'text-slate-400'
                      : (dim.val ?? 0) >= 80
                      ? 'text-emerald-700'
                      : (dim.val ?? 0) >= 60
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {isNA ? 'N/A' : `${Math.round(dim.val!)}`}
                </span>
              </div>
              <div className="w-full bg-clinical-200/80 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    isNA
                      ? 'bg-slate-300'
                      : (dim.val ?? 0) >= 80
                      ? 'bg-emerald-600'
                      : (dim.val ?? 0) >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${isNA ? 0 : dim.val}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-clinical-500">
                <span className="truncate">{dim.desc}</span>
                {!isNA && <span className="font-mono font-medium ml-1">w={weight.toFixed(2)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Weight Slider Drawer */}
      {showWeightSliders && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Configure Research Dimension Weights
            </span>
            <button
              onClick={handleApplyWeights}
              disabled={isUpdating}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span>Recalculate XQI</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {dimensions
              .filter((d) => d.val !== null)
              .map((d) => (
                <div key={d.key} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{d.label}</span>
                    <span className="font-mono font-bold">{(customWeights[d.key] || 0.15).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.50"
                    step="0.05"
                    value={customWeights[d.key] || 0.15}
                    onChange={(e) => handleSliderChange(d.key, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expandable Mathematical Formulation */}
      <div className="border-t border-clinical-100 pt-3">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center justify-between w-full text-xs font-semibold text-clinical-600 hover:text-clinical-900 select-none"
        >
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>How is XQI Formulated? (Mathematical Specification)</span>
          </div>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showFormula && (
          <div className="mt-2.5 p-3 rounded-lg bg-clinical-50 border border-clinical-200 text-xs text-clinical-700 space-y-2">
            <div className="font-mono text-[11px] p-2 rounded bg-white border border-clinical-200 text-clinical-900 overflow-x-auto">
              {xqi.mathematical_formulation}
            </div>
            <p className="text-[11px] text-clinical-500 leading-relaxed">
              <strong>Research Baseline Note:</strong> XQI dynamically renormalizes active weights when localized
              ground truth or human agreement annotations are unavailable. All dimensional inputs are normalized
              to [0, 100]. Weights require empirical calibration for specific clinical specialties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
