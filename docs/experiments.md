# Experiment Tracking & Ablation Studies

## Benchmark Experiments (EXP-01 – EXP-07)

| Exp ID | Model | XAI Ensemble | Fusion Mechanism | Mean XQI | Reliability | AUC-ROC |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **EXP-01** | DenseNet-121 | Grad-CAM++ | Single Explainer | 72.4 | 68.8 | 0.912 |
| **EXP-02** | DenseNet-121 | SHAP | Single Explainer | 75.8 | 73.5 | 0.912 |
| **EXP-03** | DenseNet-121 | Integrated Gradients | Single Explainer | 78.1 | 75.2 | 0.912 |
| **EXP-04** | DenseNet-121 | Ensemble (4 methods) | Naive Arithmetic Mean | 79.2 | 77.0 | 0.912 |
| **EXP-05** | DenseNet-121 | Ensemble (4 methods) | **TrustXAI Adaptive Fusion** | **87.6** | **92.1** | **0.912** |
| **EXP-06** | EfficientNet-B4 | Ensemble (ISIC) | **TrustXAI Adaptive Fusion** | **85.2** | **89.4** | **0.934** |
| **EXP-07** | Swin Transformer | Ensemble (BraTS) | **TrustXAI Adaptive Fusion** | **83.9** | **87.8** | **0.925** |

## Component Ablation Matrix (ABL-01 – ABL-06)

| ID | Condition | Faithfulness | Localization | Stability | Robustness | Overall XQI | Reliability |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ABL-01** | Baseline (Prediction Only) | — | — | — | — | — | — |
| **ABL-02** | + Single Explainer (Grad-CAM++) | 78.2 | 76.5 | 74.2 | 71.0 | 72.4 | 68.8 |
| **ABL-03** | + Multi-XAI (No Fusion) | 81.5 | 79.8 | 77.6 | 74.3 | 76.7 | 73.2 |
| **ABL-04** | + Uniform Mean Fusion | 83.0 | 81.8 | 82.5 | 79.2 | 79.2 | 77.0 |
| **ABL-05** | + Quality-Aware Fusion | 86.8 | 88.4 | 89.1 | 85.6 | 84.5 | 84.0 |
| **ABL-06** | **Full TrustXAI-Med (+ Uncertainty & XQI)** | **88.5** | **92.7** | **93.8** | **88.9** | **87.6** | **92.1** |
