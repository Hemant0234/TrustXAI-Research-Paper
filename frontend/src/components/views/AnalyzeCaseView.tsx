import React, { useState } from 'react';
import {
  Activity,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { CaseAnalysis, SaliencyMapData } from '../../types';
import { MedicalImageViewer } from '../image-viewer/MedicalImageViewer';
import { PredictionCard } from '../prediction/PredictionCard';
import { UncertaintyCard } from '../uncertainty/UncertaintyCard';
import { ExplainerCards } from '../xai/ExplainerCards';
import { FusionViewer } from '../fusion/FusionViewer';
import { XQIDisplay } from '../xqi/XQIDisplay';
import { TrustAssessmentPanel } from '../reliability/TrustAssessmentPanel';

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
  const [selectedExplainer, setSelectedExplainer] = useState<string>('Grad-CAM++');

  return (
    <div className="space-y-5">
      {/* Top Clinical Case Header & Case Selector */}
      <div className="bg-white rounded-xl border border-clinical-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-clinical-500 tracking-wider">
              Active Case Analysis
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold font-mono text-clinical-900">
                {currentCase.case_id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-clinical-100 text-clinical-700">
                {currentCase.modality}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-100 text-slate-700">
                {currentCase.model_name}
              </span>
            </div>
          </div>
        </div>

        {/* Case Switcher Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <span className="text-xs font-semibold text-clinical-500 mr-1 shrink-0">
            Switch Case:
          </span>
          {allCaseSummaries.map((c) => {
            const isCurrent = c.case_id === currentCase.case_id;
            return (
              <button
                key={c.case_id}
                onClick={() => onSelectCase(c.case_id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                  isCurrent
                    ? 'bg-clinical-900 text-white font-bold shadow-xs'
                    : 'bg-clinical-100 hover:bg-clinical-200 text-clinical-700 border border-clinical-200'
                }`}
              >
                <span>{c.case_id}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    c.reliability_level === 'RELIABLE'
                      ? 'bg-emerald-500'
                      : c.reliability_level === 'CAUTION'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Quick Report Link */}
        <button
          onClick={onNavigateToReports}
          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Case Report</span>
        </button>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Medical Image & Attribution Viewer (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          <MedicalImageViewer
            imageBase64={currentCase.image_base64}
            modality={currentCase.modality}
            caseId={currentCase.case_id}
            explanations={currentCase.explanations}
            fusion={currentCase.fusion}
            groundTruthBbox={currentCase.ground_truth_bbox}
            groundTruthClass={currentCase.ground_truth_class}
          />

          {/* Explanation Fusion & Spatial Agreement Lab */}
          <FusionViewer
            fusion={currentCase.fusion}
            explanations={currentCase.explanations}
            onRecalculateFusion={onRecalculateFusion}
          />
        </div>

        {/* Right Column: AI Assessment, Uncertainty, XQI, and Trustworthiness Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Trust Assessment ("Should I Trust This?") Evidence Card */}
          <TrustAssessmentPanel
            reliability={currentCase.reliability}
            uncertainty={currentCase.uncertainty}
            xqi={currentCase.xqi}
            confidenceProb={currentCase.prediction.probability}
          />

          {/* AI Diagnostic Prediction Card */}
          <PredictionCard
            prediction={currentCase.prediction}
            modelName={currentCase.model_name}
          />

          {/* Predictive Uncertainty Card */}
          <UncertaintyCard
            uncertainty={currentCase.uncertainty}
            confidenceProb={currentCase.prediction.probability}
            reliability={currentCase.reliability}
          />
        </div>
      </div>

      {/* Multi-XAI Ensemble Section */}
      <div className="pt-2">
        <ExplainerCards
          explanations={currentCase.explanations}
          selectedMethod={selectedExplainer}
          onSelectMethod={setSelectedExplainer}
        />
      </div>

      {/* Detailed Explanation Quality Index (XQI) Module */}
      <div className="pt-2">
        <XQIDisplay
          xqi={currentCase.xqi}
          onRecalculateWeights={onRecalculateXQI}
        />
      </div>
    </div>
  );
};
