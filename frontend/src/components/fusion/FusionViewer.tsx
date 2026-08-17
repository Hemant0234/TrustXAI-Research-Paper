import React, { useState } from 'react';
import { Layers, SlidersHorizontal, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { FusionResult, SaliencyMapData } from '../../types';

interface FusionViewerProps {
  fusion: FusionResult;
  explanations: Record<string, SaliencyMapData>;
  onRecalculateFusion?: (weights: Record<string, number>) => void;
}

export const FusionViewer: React.FC<FusionViewerProps> = ({
  fusion,
  explanations,
  onRecalculateFusion
}) => {
  const [weights, setWeights] = useState<Record<string, number>>(fusion.weights_used);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleSliderChange = (method: string, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [method]: val
    }));
  };

  const handleApply = async () => {
    if (onRecalculateFusion) {
      setIsUpdating(true);
      await onRecalculateFusion(weights);
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-clinical-200 shadow-sm p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-700 block">
              Hybrid Explanation Fusion Engine
            </span>
            <span className="text-[11px] text-clinical-500 font-medium">
              Strategy: {fusion.fusion_strategy}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-clinical-500 block uppercase font-medium">
            Cross-Method Agreement
          </span>
          <span className="text-base font-bold font-mono text-blue-600">
            {Math.round(fusion.overall_agreement * 100)}%
          </span>
        </div>
      </div>

      {/* Pipeline Diagram Flow */}
      <div className="bg-clinical-50/75 rounded-lg p-3 border border-clinical-200 text-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex flex-col space-y-1 shrink-0">
          <span className="text-[10px] uppercase font-bold text-clinical-500">4 Explainers</span>
          <span className="px-2 py-0.5 rounded bg-white border border-clinical-200 font-mono text-[11px]">
            GradCAM • SHAP • IG • Attn
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-clinical-400 shrink-0" />
        <div className="flex flex-col space-y-1 shrink-0">
          <span className="text-[10px] uppercase font-bold text-clinical-500">Fusion Engine</span>
          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-medium text-[11px]">
            Quality & Uncertainty Gating
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-clinical-400 shrink-0" />
        <div className="flex flex-col space-y-1 shrink-0">
          <span className="text-[10px] uppercase font-bold text-clinical-500">Unified Output</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
            Fused Saliency Map
          </span>
        </div>
      </div>

      {/* Pairwise Agreement Breakdown */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-clinical-700 block">
          Pairwise Spatial Agreement Matrix
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(fusion.pairwise_agreement || {}).map(([pair, corr]) => {
            const perc = Math.round(corr * 100);
            return (
              <div
                key={pair}
                className="p-2 rounded-lg bg-clinical-50 border border-clinical-100 flex items-center justify-between text-xs"
              >
                <span className="text-clinical-600 font-medium truncate pr-1">{pair}</span>
                <span
                  className={`font-mono font-bold shrink-0 ${
                    perc >= 80 ? 'text-emerald-600' : perc >= 60 ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  {perc}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Weight Configuration */}
      <div className="space-y-3 pt-2 border-t border-clinical-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-clinical-700 flex items-center space-x-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Attribution Weights</span>
          </span>
          <button
            onClick={handleApply}
            disabled={isUpdating}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center space-x-1 transition-colors disabled:opacity-50"
          >
            {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            <span>Apply Weights</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(explanations).map((m) => {
            const currentW = weights[m] ?? 0.25;
            return (
              <div key={m} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-clinical-600 font-medium">{m}</span>
                  <span className="font-mono text-clinical-800 font-bold">
                    {(currentW * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentW}
                  onChange={(e) => handleSliderChange(m, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-clinical-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
