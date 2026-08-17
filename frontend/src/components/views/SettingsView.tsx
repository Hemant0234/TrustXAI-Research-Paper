import React from 'react';
import { Settings, ShieldAlert, Cpu, Database, Info, GitBranch, Terminal } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-clinical-100 text-clinical-800 border border-clinical-200">
            System & Methodology
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
          Research Methodology & System Architecture
        </h1>
        <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
          Complete specification of the scientific pipeline, literature research gaps (RG1–RG5),
          architectural components, and environment configuration for live research inference.
        </p>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-clinical-100 pb-3">
          <GitBranch className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
            TrustXAI-Med Operational Pipeline Flowchart
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed border border-slate-800">
{`
                MEDICAL IMAGE (DICOM / PNG / JPEG)
                                │
                                ▼
                    DIAGNOSTIC MODEL (DenseNet-121 / ViT / Swin)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
             PREDICTION                   UNCERTAINTY
          (Class Logits)           (Normalized Entropy & ECE)
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
                       MULTIPLE XAI EXPLAINERS
                 ┌──────────┬──────────┬──────────┐
                 ▼          ▼          ▼          ▼
              Grad-CAM++   SHAP       IG      Attention
                 └──────────┴──────────┴──────────┘
                                │
                                ▼
                       EXPLANATION FUSION
                 (Quality-Aware + Agreement-Weighted)
                                │
                                ▼
                       UNIFIED EXPLANATION
                     (Agreement / Disagreement Maps)
                                │
                                ▼
                 EXPLANATION QUALITY INDEX (XQI)
                     (7-Dimension Weighted Score)
                                │
                                ▼
                     EXPLANATION RELIABILITY
                 ("Should I Trust This Explanation?")
                                │
                                ▼
                          CLINICAL TRUST
                                │
                                ▼
                      DECISION SUPPORT ACTION
               (RELIABLE / CAUTION / REVIEW REQUIRED)
`}
        </div>
      </div>

      {/* 5 Literature Research Gaps Addressed */}
      <div className="bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-clinical-100 pb-3">
          <Info className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
            Five Scientific Research Gaps Addressed (RG1 – RG5)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 space-y-1">
            <span className="font-bold font-mono text-blue-700 text-[11px]">RG1 — Explanation-Level Fusion Gap</span>
            <p className="text-clinical-700 leading-relaxed">
              Standard systems generate multiple explainers in isolation. TrustXAI-Med provides a principled,
              uncertainty-aware spatial fusion mechanism instead of naive arithmetic heatmap averaging.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 space-y-1">
            <span className="font-bold font-mono text-blue-700 text-[11px]">RG2 — Explanation Reliability Gap</span>
            <p className="text-clinical-700 leading-relaxed">
              High prediction accuracy does not guarantee reliable explanation. TrustXAI explicitly isolates prediction
              confidence from explanation reliability.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 space-y-1">
            <span className="font-bold font-mono text-blue-700 text-[11px]">RG3 — Quantitative Quality Gap</span>
            <p className="text-clinical-700 leading-relaxed">
              Replaces qualitative visual inspection with a 7-dimensional Explanation Quality Index (XQI)
              with transparent weighting and mathematical formulation.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 space-y-1">
            <span className="font-bold font-mono text-blue-700 text-[11px]">RG4 — Uncertainty → Reliability Gap</span>
            <p className="text-clinical-700 leading-relaxed">
              Directly gates explanation trust by predictive entropy and calibration error, preventing clinician overreliance
              on spurious attributions.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 space-y-1 md:col-span-2">
            <span className="font-bold font-mono text-blue-700 text-[11px]">RG5 — Cross-Domain & Clinical Validation Gap</span>
            <p className="text-clinical-700 leading-relaxed">
              Validates methodology across radiology (CheXpert), dermoscopy (ISIC), and neuro-imaging (BraTS),
              coupled with a 4-condition reader study protocol.
            </p>
          </div>
        </div>
      </div>

      {/* Environment Configuration Guide for Live Research Mode */}
      <div className="bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-clinical-100 pb-3">
          <Terminal className="w-4 h-4 text-clinical-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
            Real Research Mode Environment Variables
          </span>
        </div>

        <div className="bg-clinical-50 p-3 rounded-lg font-mono text-xs text-clinical-800 border border-clinical-200 space-y-1">
          <div>MODEL_PATH=/path/to/checkpoints/densenet121_chexpert.pth</div>
          <div>DATASET_ROOT=/path/to/medical_datasets/</div>
          <div>CHEXPERT_ROOT=/path/to/chexpert/</div>
          <div>CHEXLOCALIZE_ROOT=/path/to/chexlocalize/</div>
          <div>ISIC_ROOT=/path/to/isic2024/</div>
          <div>BRATS_ROOT=/path/to/brats2023/</div>
        </div>
      </div>

      {/* Strict Medical Ethics and Research Disclaimers */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-slate-900">
          <ShieldAlert className="w-4 h-4 text-slate-700" />
          <span>Research Prototype Disclaimer & Medical Ethics Notice</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          TrustXAI-Med is a research evaluation prototype designed to explore explainability metrics and uncertainty estimation.
          It has not received regulatory clearance (FDA 510(k), CE mark) for diagnostic deployment. Under no circumstances should
          outputs be interpreted as autonomous medical diagnoses or patient-specific treatment instructions.
        </p>
      </div>
    </div>
  );
};
