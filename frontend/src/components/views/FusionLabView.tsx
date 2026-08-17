import React from 'react';
import { Cog, Check, ArrowRight, Layers, Sliders } from 'lucide-react';
import { CaseAnalysis } from '../../types';

interface FusionLabViewProps {
  currentCase: CaseAnalysis;
  onRecalculateFusion?: (weights: Record<string, number>) => Promise<void>;
}

export const FusionLabView: React.FC<FusionLabViewProps> = ({
  currentCase,
  onRecalculateFusion
}) => {
  const methodNames = ['Grad-CAM++', 'SHAP', 'Integrated Gradients', 'Attention Rollout'];

  const pairwise = [
    { pair: 'Grad-CAM++ ↔ SHAP', agreement: 84 },
    { pair: 'Grad-CAM++ ↔ IG', agreement: 78 },
    { pair: 'SHAP ↔ IG', agreement: 81 },
    { pair: 'Attention ↔ Grad-CAM++', agreement: 72 }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fusion Lab</h1>
          <p className="text-xs text-slate-500 font-medium">
            Hybrid explanation fusion for {currentCase.case_id}
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Demo Mode
        </span>
      </div>

      {/* Top Section: Fusion Pipeline Flowchart & Fused Heatmap + Fusion Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Pipeline Diagram + Fused Visual (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            FUSION PIPELINE
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* 4 Explainer Input Blocks */}
            <div className="md:col-span-4 space-y-2">
              {methodNames.map((name) => (
                <div
                  key={name}
                  className="px-3 py-1.5 bg-slate-50 rounded border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between"
                >
                  <span>{name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    w={(currentCase.fusion.weights_used[name] || 0.25).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Fusion Engine Node */}
            <div className="md:col-span-2 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-600 shadow-2xs">
                <Cog className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1">Fusion Engine</span>
            </div>

            {/* Fused Explanation Visual */}
            <div className="md:col-span-6 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Fused Explanation
              </div>
              <div className="w-full h-48 bg-black rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center">
                <img
                  src={currentCase.image_base64}
                  alt="Fused Output"
                  className="w-full h-full object-contain opacity-75"
                />
                <div className="absolute inset-0 bg-blue-500/30 mix-blend-screen" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fusion Summary Table (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            FUSION SUMMARY
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Explanation Confidence</span>
              <span className="font-mono font-bold text-slate-900">0.89</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Cross-Method Agreement</span>
              <span className="font-mono font-bold text-slate-900">0.87</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Dominant Weight: Grad-CAM++</span>
              <span className="font-mono font-bold text-blue-600">0.32</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">SHAP</span>
              <span className="font-mono font-bold text-slate-700">0.28</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Integrated Gradients</span>
              <span className="font-mono font-bold text-slate-700">0.24</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Attention Rollout</span>
              <span className="font-mono font-bold text-slate-700">0.16</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Agreement Map, Saliency Details, & Pairwise Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Agreement Map */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            AGREEMENT MAP
          </div>
          <div className="w-full h-36 bg-black rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center">
            <img
              src={currentCase.image_base64}
              alt="Agreement"
              className="w-full h-full object-contain opacity-70"
            />
            <div className="absolute inset-0 bg-emerald-500/20 mix-blend-screen" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>High Agreement</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Disagreement</span>
            </span>
          </div>
        </div>

        {/* Card 2: Disagreement Map */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            DISAGREEMENT MAP (VARIANCE)
          </div>
          <div className="w-full h-36 bg-black rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center">
            <img
              src={currentCase.image_base64}
              alt="Disagreement"
              className="w-full h-full object-contain opacity-70"
            />
            <div className="absolute inset-0 bg-rose-500/20 mix-blend-screen" />
          </div>
          <p className="text-[10px] text-slate-500 pt-1">
            Highlights anatomical regions where explainers diverge in attribution.
          </p>
        </div>

        {/* Card 3: Method Agreement (Pairwise) */}
        <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            METHOD AGREEMENT (PAIRWISE)
          </div>
          <div className="space-y-1.5 text-xs">
            {pairwise.map((p) => (
              <div
                key={p.pair}
                className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-600 font-medium">{p.pair}</span>
                <span className="font-mono font-bold text-slate-900">{p.agreement}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
