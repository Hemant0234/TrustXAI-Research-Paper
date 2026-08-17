# TrustXAI-Med System Architecture

## Overview
TrustXAI-Med is structured as a decoupled full-stack research system comprising:
1. **Clinical Command Center Frontend:** Built with React 18, TypeScript, Tailwind CSS, Lucide icons, and HTML5 Canvas Saliency Renderers.
2. **Research Decision Support Backend:** Built with FastAPI, Pydantic v2, PyTorch/Torchvision/Captum integration hooks, and mathematical fusion/XQI calculation engines.
3. **Multi-XAI Adapter Engine:** Pluggable explainer interfaces for Grad-CAM++, SHAP, Integrated Gradients, and Attention Rollout.
4. **Uncertainty & Reliability Gating Pipeline:** Predictive entropy estimators and dynamic reliability assessors.

---

## Architectural Flowchart

```text
                  [ MEDICAL IMAGE INPUT ]
                             │
                             ▼
                 [ DIAGNOSTIC MODEL LAYER ]
                 (DenseNet-121 / ViT / Swin)
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     [ CLASS PREDICTION ]        [ PREDICTIVE UNCERTAINTY ]
     - Logits distribution       - Shannon Entropy
     - Top class confidence      - Calibration Error (ECE)
              │                  - Monte Carlo Variance
              └──────────────┬──────────────┘
                             ▼
              [ MULTI-XAI EXPLAINER ENSEMBLE ]
              ├─ Grad-CAM++ (Gradient Activation)
              ├─ SHAP (Shapley Superpixel Attribution)
              ├─ Integrated Gradients (Path Integral)
              └─ Attention Rollout (Transformer Flow)
                             │
                             ▼
                [ EXPLANATION FUSION ENGINE ]
              ├─ Spatial alignment & percentile clipping
              ├─ Pairwise Pearson correlation matrix
              ├─ Quality-aware dynamic weights
              └─ Output: Fused Saliency + Agreement / Disagreement Maps
                             │
                             ▼
             [ EXPLANATION QUALITY INDEX (XQI) ]
              ├─ Faithfulness (Pixel Masking / Sensitivity-n)
              ├─ Localization (IoU with Expert Annotations)
              ├─ Perturbation Robustness (SSIM under Noise)
              ├─ Algorithmic Stability (Variance across Seeds)
              ├─ Cross-Method Consistency (Ensemble Correlation)
              ├─ Human Agreement (Reader Likert Study)
              └─ Uncertainty Alignment (Entropy Gating)
                             │
                             ▼
            [ EXPLANATION RELIABILITY ENGINE ]
              ├─ Evaluates "Should I Trust This Explanation?"
              ├─ Generates Positive Evidence vs Risk Concerns
              └─ Outputs: RELIABLE / CAUTION / REVIEW REQUIRED
                             │
                             ▼
              [ CLINICAL DECISION SUPPORT ACTION ]
```

---

## Key Backend Components

### 1. `backend/app/schemas/cases.py`
Defines strict Pydantic v2 data transfer schemas for predictions, uncertainty metrics, saliency matrices, fusion results, XQI dimensional components, and reliability assessments.

### 2. `backend/app/fusion/fusion_engine.py`
Implements `ExplanationFusionEngine`. Replaces naive arithmetic averaging with:
$$w_m = \frac{\text{QualityFactor}_m \cdot \text{MeanAgreement}_m}{\sum_k \text{QualityFactor}_k \cdot \text{MeanAgreement}_k}$$
modulated by predictive uncertainty:
$$\text{FusionConfidence} = \text{OverallAgreement} \cdot (1 - 0.4 \cdot \text{UncertaintyScore})$$

### 3. `backend/app/quality/xqi.py`
Calculates the 7-dimensional Explanation Quality Index with automatic weight renormalization when localization or human annotations are missing.

### 4. `backend/app/reliability/reliability_engine.py`
Assesses evidence factors and produces research verdicts (`RELIABLE`, `CAUTION`, `REVIEW REQUIRED`).
