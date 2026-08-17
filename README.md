# TrustXAI-Med: Uncertainty-Aware Hybrid XAI for Medical Image Diagnosis

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Research Status](https://img.shields.io/badge/Status-Research%20Prototype-amber.svg)](#)

> **Research Motivation:** *“Can predictive uncertainty and explanation quality metrics be combined to determine whether a medical AI explanation should—or should not—be trusted in clinical decision support?”*

---

## 1. Executive Summary & Research Positioning

Standard explainable AI (XAI) systems in medical imaging suffer from a critical flaw: they stop at generating a heatmap and displaying class probability (*“Upload Image $\rightarrow$ Predict Disease $\rightarrow$ Show Heatmap”*).

However, high model accuracy or high prediction confidence **does not imply that an explanation is faithful, stable, or clinically trustworthy**.

**TrustXAI-Med** is a full-stack, research-grade software platform that operationalizes an end-to-end trustworthy AI pipeline:

```text
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
```

---

## 2. Five Scientific Research Gaps Addressed

1. **RG1 — Explanation-Level Fusion Gap:** Instead of generating multiple explainers independently without synthesis, TrustXAI-Med provides a modular, quality-aware, agreement-weighted, and uncertainty-gated spatial fusion engine.
2. **RG2 — Explanation Reliability Gap:** Prediction reliability $\neq$ explanation reliability. The system systematically decouples class prediction probability from explanation trust.
3. **RG3 — Quantitative Explanation Quality Gap:** Replaces subjective visual inspection with a 7-dimensional **Explanation Quality Index (XQI)** ($w_F\text{Faithfulness} + w_L\text{Localization} + w_R\text{Robustness} + w_S\text{Stability} + w_C\text{Consistency} + w_H\text{Human Agreement} + w_U\text{Uncertainty Alignment}$).
4. **RG4 — Uncertainty $\rightarrow$ Reliability Gap:** Uses predictive entropy, dispersion, and Expected Calibration Error (ECE) to directly penalize ungrounded explanations.
5. **RG5 — Cross-Domain / Clinical Validation Gap:** Validates the pipeline across Chest Radiographs (CheXpert / CheXlocalize), Dermoscopy (ISIC), and Volumetric Brain MRI (BraTS), coupled with a 4-condition clinician reader study protocol.

---

## 3. The Killer Demo: Case TX-2047

To demonstrate why TrustXAI-Med is essential, inspect **Case TX-2047 (Cardiomegaly)**:

| Metric | Traditional XAI Dashboard | TrustXAI-Med Assessment |
| :--- | :--- | :--- |
| **AI Diagnosis** | Cardiomegaly | Cardiomegaly |
| **Prediction Confidence** | **93.2% (High)** | **93.2%** |
| **Predictive Uncertainty** | *Ignored* | **High (Entropy: 0.62, ECE: 0.18)** |
| **Multi-XAI Agreement** | *Single Heatmap Shown* | **Severe Spatial Disagreement (48.5%)** |
| **XQI Quality Score** | *Unmeasured* | **49.0 / 100 (Low Quality)** |
| **Explanation Reliability**| *Assumed Reliable* | **46.0 / 100 (Unreliable)** |
| **Clinical Action** | *Accepted Blindly* | **⚠️ REVIEW REQUIRED** |

A standard dashboard presents a convincing heatmap and encourages overreliance. **TrustXAI-Med actively protects the clinician from trusting a fragile explanation.**

---

## 4. Key Modules & Features

- **Clinical Case Analysis Command Center:** High-performance medical image viewer with pan, zoom, opacity, noise thresholding, contour overlays, and Side-by-Side comparison mode.
- **Modular Explanation Fusion Lab:** Interactive pairwise correlation matrix ($4\times 4$), agreement maps, disagreement contour isolation, and dynamic attribution weight sliders.
- **7-D XQI Breakdown:** Formula inspector, customizable dimension weights, and dynamic weight renormalization for missing annotations.
- **Robustness Perturbation Lab:** Live simulation of Gaussian noise, blur, contrast shifts, rotation, and cropping with saliency drift diff maps.
- **Cross-Domain Validation Lab:** Multi-dataset benchmarking across CXR, Dermoscopy, and Neuro-MRI.
- **Experiments & Ablation Matrix:** Benchmark comparison and component ablation tracking.
- **Clinician Trust Study Module:** 4-condition reader simulation protocol (Conditions A, B, C, D) measuring diagnostic accuracy, confidence, decision time, and reduction of AI overreliance.
- **Research Reports Generator:** Generates full provenance-backed Markdown, JSON, and CSV research dossiers with print-to-PDF support.

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Running Unit Tests

```bash
cd backend
pytest tests/ -v
```

---

## 7. Dual Mode: Demo vs. Real Research Mode

- **Demo Mode (Zero-Dependency):** Bundles high-fidelity synthetic scans, deterministic heatmaps, and metric pipelines. All simulated metrics are marked with `{ "source": "demo", "simulated": true }`.
- **Real Research Mode:** To attach live PyTorch models and datasets, configure environment variables:
  ```bash
  export MODEL_PATH=/path/to/densenet121_chexpert.pth
  export DATASET_ROOT=/path/to/datasets/
  export CHEXPERT_ROOT=/path/to/chexpert/
  export CHEXLOCALIZE_ROOT=/path/to/chexlocalize/
  export ISIC_ROOT=/path/to/isic2024/
  export BRATS_ROOT=/path/to/brats2023/
  ```

---

## 8. Research Disclaimer & Medical Safety

> [!IMPORTANT]
> **RESEARCH USE ONLY:** TrustXAI-Med is an experimental research prototype for scientific evaluation and educational demonstration. It is **not** certified by the FDA, CE, or any regulatory body for clinical diagnostic use, treatment planning, or autonomous medical decisions.
