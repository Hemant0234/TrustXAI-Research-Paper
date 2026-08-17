import React from 'react';
import { ShieldCheck, Award, Info, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { CaseAnalysis } from '../../types';
import { XQIDisplay } from '../xqi/XQIDisplay';
import { TrustAssessmentPanel } from '../reliability/TrustAssessmentPanel';

interface ReliabilityViewProps {
  currentCase: CaseAnalysis;
  onRecalculateXQI: (weights: Record<string, number>) => Promise<void>;
}

export const ReliabilityView: React.FC<ReliabilityViewProps> = ({
  currentCase,
  onRecalculateXQI
}) => {
  const metricDetails = [
    {
      id: 'faithfulness',
      name: 'Model Faithfulness',
      score: currentCase.xqi.faithfulness,
      definition: 'Measures how accurately the explanation reflects the underlying diagnostic features used by the neural network.',
      method: 'Pixel Masking & Output Logit Drop Analysis (Sensitivity-n)',
      source: 'Internal Model Attribution Gradients',
      interpretation: 'High faithfulness indicates removing salient pixels systematically degrades target class confidence.'
    },
    {
      id: 'localization',
      name: 'Clinical Localization',
      score: currentCase.xqi.localization,
      definition: 'Measures the spatial overlap (IoU / Saliency Recall) between the explanation and verified expert radiologist segmentations.',
      method: 'Intersection-over-Union against CheXlocalize / Expert Contours',
      source: 'Certified Radiologist Ground-Truth Annotations',
      interpretation: currentCase.xqi.localization !== null
        ? 'Attribution tightly encapsulates the verified anatomical lesion without excess background spill.'
        : 'Ground-truth clinician localization annotations are not available for this specific dataset slice.'
    },
    {
      id: 'robustness',
      name: 'Perturbation Robustness',
      score: currentCase.xqi.robustness,
      definition: 'Quantifies explanation invariance against non-semantic input noise, brightness shifts, and detector blur.',
      method: 'Structural Similarity Index (SSIM) under Controlled Noise Injectors',
      source: 'Synthetic Perturbation Lab Suite',
      interpretation: 'High robustness indicates the heatmap remains consistent across sensor and acquisition variations.'
    },
    {
      id: 'stability',
      name: 'Algorithmic Stability',
      score: currentCase.xqi.stability,
      definition: 'Assesses variance and reproducibility of the explainer when evaluated across stochastic sampling seeds.',
      method: 'Monte Carlo Seed Perturbations & Gradient Variance',
      source: 'Internal Explainer Kernel Re-runs',
      interpretation: 'Stable explainers yield consistent attribution maps across multiple evaluation passes.'
    },
    {
      id: 'consistency',
      name: 'Cross-Method Consistency',
      score: currentCase.xqi.consistency,
      definition: 'Measures spatial correlation between gradient, perturbation, and attention-based attribution methods.',
      method: 'Pairwise Pearson Correlation & Cosine Similarity',
      source: 'Multi-XAI Explainer Ensemble',
      interpretation: 'Consensus across distinct explainer paradigms strongly corroborates anatomical saliency.'
    },
    {
      id: 'human_agreement',
      name: 'Human Agreement',
      score: currentCase.xqi.human_agreement,
      definition: 'Direct clinician reader evaluation of explanation utility, clarity, and diagnostic concordance.',
      method: '4-Condition Blinded Clinician Reader Study (Likert 1-5)',
      source: 'Clinical Trust Study Reader Responses',
      interpretation: currentCase.xqi.human_agreement !== null
        ? 'Clinicians affirm high diagnostic relevance and anatomical concordance.'
        : 'Human reader study data is not yet recorded for this specific individual case (Simulated default: N/A).'
    },
    {
      id: 'uncertainty_alignment',
      name: 'Uncertainty Alignment',
      score: currentCase.xqi.uncertainty_alignment,
      definition: 'Evaluates coherence between prediction confidence, normalized predictive entropy, and calibration error.',
      method: 'Entropy Gating & Expected Calibration Error (ECE) Penalties',
      source: 'Softmax Distribution & Monte Carlo Dropout Dispersion',
      interpretation: 'High alignment confirms high confidence corresponds with genuinely low predictive entropy.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Explanation Quality Index & Reliability
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
          Quantitative Quality & Reliability Assessment
        </h1>
        <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
          Addressing the <strong>Quantitative Quality Gap (RG3)</strong> and <strong>Explanation Reliability Gap (RG2)</strong>.
          Every explanation is evaluated against 7 distinct quality dimensions before receiving a clinical trust recommendation.
        </p>
      </div>

      {/* Trust Assessment Panel */}
      <TrustAssessmentPanel
        reliability={currentCase.reliability}
        uncertainty={currentCase.uncertainty}
        xqi={currentCase.xqi}
        confidenceProb={currentCase.prediction.probability}
      />

      {/* Primary XQI Score & Configurator */}
      <XQIDisplay
        xqi={currentCase.xqi}
        onRecalculateWeights={onRecalculateXQI}
      />

      {/* Deep-Dive Metric Documentation Cards */}
      <div className="bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-clinical-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
              Detailed Dimension Specification & Provenance
            </span>
          </div>
          <span className="text-[11px] text-clinical-500 font-mono">
            Case: {currentCase.case_id}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricDetails.map((m) => {
            const isNA = m.score === null || m.score === undefined;
            return (
              <div
                key={m.id}
                className="p-3.5 rounded-lg bg-clinical-50/75 border border-clinical-200/80 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-clinical-900 text-xs block">{m.name}</span>
                    <span className="text-[10px] text-clinical-500 font-mono">{m.source}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                      isNA
                        ? 'bg-slate-200 text-slate-700'
                        : m.score! >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.score! >= 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isNA ? 'N/A' : `${Math.round(m.score!)} / 100`}
                  </span>
                </div>

                <p className="text-clinical-700 text-[11px] leading-relaxed">
                  <strong>Definition:</strong> {m.definition}
                </p>

                <div className="text-[10px] text-clinical-600 space-y-0.5 border-t border-clinical-200/60 pt-1.5">
                  <div><strong>Measurement Method:</strong> {m.method}</div>
                  <div><strong>Clinical Interpretation:</strong> {m.interpretation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
