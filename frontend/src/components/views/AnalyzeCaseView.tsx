import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  SplitSquareVertical,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { CaseAnalysis } from '../../types';
import { MedicalImageViewer } from '../image-viewer/MedicalImageViewer';

interface AnalyzeCaseViewProps {
  currentCase: CaseAnalysis;
  allCaseSummaries: { case_id: string; modality: string; predicted_label: string; reliability_level: string }[];
  onSelectCase: (caseId: string) => void;
  onRecalculateFusion: (weights: Record<string, number>) => Promise<void>;
  onRecalculateXQI: (weights: Record<string, number>) => Promise<void>;
  onNavigateToReports: () => void;
}

export const AnalyzeCaseView: React.FC<AnalyzeCaseViewProps> = ({
  currentCase,
  allCaseSummaries,
  onSelectCase,
  onRecalculateFusion,
  onRecalculateXQI,
  onNavigateToReports
}) => {
  const [selectedOverlay, setSelectedOverlay] = useState<string>('fused');
  const confPercent = (currentCase.prediction.probability * 100).toFixed(1);
  const isReliable = currentCase.reliability.level === 'RELIABLE';
  const isCaution = currentCase.reliability.level === 'CAUTION';

  const explainerThumbnails = [
    { id: 'gradcam', name: 'Grad-CAM++', matrix: currentCase.explanations['Grad-CAM++']?.matrix },
    { id: 'shap', name: 'SHAP', matrix: currentCase.explanations['SHAP']?.matrix },
    { id: 'ig', name: 'Integrated Gradients', matrix: currentCase.explanations['Integrated Gradients']?.matrix },
    { id: 'attention', name: 'Attention Rollout', matrix: currentCase.explanations['Attention Rollout']?.matrix },
    { id: 'fused', name: 'Fused', matrix: currentCase.fusion.fused_matrix }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Analyze Case &gt; <span className="font-mono text-blue-600">{currentCase.case_id}</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              {currentCase.modality} • {currentCase.dataset.split('/')[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Case switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {allCaseSummaries.map((c) => (
              <button
                key={c.case_id}
                onClick={() => onSelectCase(c.case_id)}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                  c.case_id === currentCase.case_id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {c.case_id}
              </button>
            ))}
          </div>

          {/* Upload Unseen Image for Real Inference */}
          <label className="cursor-pointer text-xs px-2.5 py-1 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs flex items-center space-x-1.5 transition-all">
            <span>+ Upload Scan</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const result = await (await import('../../lib/api')).api.uploadImageForInference(file);
                    // Pass to parent or update state
                    alert(`Inference completed for ${file.name}: Predicted ${result.prediction.label} (${(result.prediction.probability * 100).toFixed(1)}%) with ${result.uncertainty.level} uncertainty.`);
                  } catch (err: any) {
                    alert(err.message || 'Inference failed');
                  }
                }
              }}
            />
          </label>

          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Analysis Completed</span>
          </span>
        </div>
      </div>

      {/* Main Analysis Layout: Left Image Viewer, Right Diagnostic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Original Image & Saliency Viewer (7 cols) */}
        <div className="lg:col-span-7">
          <MedicalImageViewer
            imageBase64={currentCase.image_base64}
            modality={currentCase.modality}
            caseId={currentCase.case_id}
            explanations={currentCase.explanations}
            fusion={currentCase.fusion}
            groundTruthBbox={currentCase.ground_truth_bbox}
            groundTruthClass={currentCase.ground_truth_class}
          />
        </div>

        {/* Right: AI Diagnosis & Uncertainty Module (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Card 1: AI Diagnosis */}
          <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              AI DIAGNOSIS
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentCase.prediction.label}
                </span>
                <span className="text-xs text-slate-500 block font-medium">Primary Prediction</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Probability</span>
                <span className="text-xl font-bold font-mono text-slate-900">{confPercent}%</span>
              </div>
            </div>

            {/* Alternative Findings list */}
            <div className="border-t border-slate-100 pt-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Alternative Findings
              </span>
              <div className="space-y-1 text-xs">
                {Object.entries(currentCase.prediction.probabilities)
                  .filter(([label]) => label !== currentCase.prediction.label)
                  .slice(0, 3)
                  .map(([label, prob]) => (
                    <div key={label} className="flex justify-between items-center text-slate-600">
                      <span>{label}</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Card 2: Prediction Confidence Circular Gauge */}
          <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                PREDICTION CONFIDENCE
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Estimated probability for top predicted class
              </p>
            </div>
            {/* SVG Circular Gauge */}
            <div className="w-16 h-16 relative shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeDasharray={`${currentCase.prediction.probability * 88} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono font-bold text-xs text-slate-900">
                {confPercent}%
              </span>
            </div>
          </div>

          {/* Card 3: Prediction Uncertainty */}
          <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                PREDICTION UNCERTAINTY
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold uppercase font-mono ${
                  currentCase.uncertainty.level === 'low'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : currentCase.uncertainty.level === 'moderate'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {currentCase.uncertainty.level}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center space-x-1">
                <span>Confidence ≠ Certainty</span>
              </div>
              <p className="leading-snug text-[10px] text-slate-500">
                Confidence is the model's estimated probability. Uncertainty estimates how reliable that prediction is.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: XQI Explanations Gallery + Should I Trust This */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bottom Left: XQI Score + 5-Method Thumbnail Gallery (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="shrink-0 space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              XQI (EXPLANATION QUALITY)
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black font-mono text-slate-900">
                {currentCase.xqi.overall.toFixed(0)}
              </span>
              <span className="text-xs text-slate-400 font-bold font-mono">/100</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold block text-center ${
                currentCase.xqi.overall >= 80
                  ? 'bg-emerald-50 text-emerald-700'
                  : currentCase.xqi.overall >= 60
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {currentCase.xqi.overall >= 80 ? 'High Quality' : 'Moderate Quality'}
            </span>
          </div>

          {/* 5 Thumbnails */}
          <div className="grid grid-cols-5 gap-2 w-full max-w-xl">
            {explainerThumbnails.map((th) => (
              <div
                key={th.id}
                onClick={() => setSelectedOverlay(th.id)}
                className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                  selectedOverlay === th.id
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="w-full h-14 bg-black rounded overflow-hidden relative shadow-inner mb-1 flex items-center justify-center">
                  <img
                    src={currentCase.image_base64}
                    alt={th.name}
                    className="w-full h-full object-contain opacity-70"
                  />
                  <div className="absolute inset-0 bg-blue-500/20 mix-blend-screen" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 block truncate">
                  {th.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right: Should I Trust This? (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            SHOULD I TRUST THIS?
          </div>

          <div
            className={`p-3 rounded-lg border flex items-center space-x-2.5 ${
              isReliable
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isCaution
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {isReliable ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-extrabold text-sm block leading-tight">
                {currentCase.reliability.level}
              </span>
              <span className="text-[10px] font-medium opacity-85 block">
                {isReliable
                  ? 'High reliability explanation'
                  : 'Review required before clinical reliance'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
