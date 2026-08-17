import React from 'react';
import { Layers, ArrowRight, ShieldCheck, Cpu, Sliders, CheckCircle2 } from 'lucide-react';
import { CaseAnalysis } from '../../types';
import { FusionViewer } from '../fusion/FusionViewer';
import { ExplainerCards } from '../xai/ExplainerCards';
import { MedicalImageViewer } from '../image-viewer/MedicalImageViewer';

interface ExplanationLabViewProps {
  currentCase: CaseAnalysis;
  onRecalculateFusion: (weights: Record<string, number>) => Promise<void>;
}

export const ExplanationLabView: React.FC<ExplanationLabViewProps> = ({
  currentCase,
  onRecalculateFusion
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Research Lab
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
          Explanation Fusion & Multi-XAI Lab
        </h1>
        <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
          Investigating the <strong>Explanation-Level Fusion Gap (RG1)</strong>. Rather than naively averaging heatmaps,
          TrustXAI-Med implements a modular fusion mechanism incorporating per-method faithfulness, perturbation stability,
          spatial consensus, and predictive uncertainty gating.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
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

        <div className="lg:col-span-6 space-y-6">
          <FusionViewer
            fusion={currentCase.fusion}
            explanations={currentCase.explanations}
            onRecalculateFusion={onRecalculateFusion}
          />
        </div>
      </div>

      {/* 4 Explainer Ensemble Deep-Dive */}
      <ExplainerCards explanations={currentCase.explanations} />
    </div>
  );
};
