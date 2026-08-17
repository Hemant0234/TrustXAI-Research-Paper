# TrustXAI-Med Research Methodology

## Research Motivation & Five Gaps (RG1 – RG5)

Medical AI diagnostic models achieve remarkable classification accuracy across thoracic radiograph benchmarks, dermatological screening, and neuro-oncology MRI. However, translation into clinical decision-support environments remains limited by **trust deficits**.

Standard practice presents an attribution heatmap alongside top-class softmax probability. This assumes two flawed premises:
1. High class probability implies a faithful, stable explanation.
2. A visually convincing heatmap warrants clinical reliance.

TrustXAI-Med addresses five foundational research gaps:

### RG1: Explanation-Level Fusion Gap
While single explainers (e.g. Grad-CAM, SHAP, Integrated Gradients, Attention Rollout) offer distinct axiomatic properties (e.g., Completeness, Implementation Invariance, Local Fidelity), they frequently generate discordant spatial attributions for the same clinical scan. TrustXAI-Med introduces a **quality-aware, agreement-weighted, and uncertainty-gated explanation fusion engine** that produces a unified saliency map accompanied by explicit agreement and disagreement maps.

### RG2: Explanation Reliability Gap
Diagnostic accuracy and prediction calibration do not guarantee explanation reliability. TrustXAI-Med establishes an **Explanation Reliability Engine** that evaluates whether the visual attribution should be clinically trusted.

### RG3: Quantitative Explanation Quality Gap (XQI)
Replacing subjective visual inspection with a 7-dimensional **Explanation Quality Index (XQI)**:
$$XQI = \sum_{d \in D} \tilde{w}_d \cdot S_d$$
where $D = \{\text{Faithfulness}, \text{Localization}, \text{Robustness}, \text{Stability}, \text{Consistency}, \text{HumanAgreement}, \text{UncertaintyAlignment}\}$.

### RG4: Predictive Uncertainty $\rightarrow$ Reliability Gap
By directly integrating normalized Shannon Entropy and Expected Calibration Error (ECE), TrustXAI-Med penalizes ungrounded heatmaps generated in regions of high predictive dispersion.

### RG5: Cross-Domain & Clinical Validation Gap
The platform establishes benchmarks across:
- **Chest Radiographs (CXR):** CheXpert + CheXlocalize (Pixel-level radiologist segmentations)
- **Dermoscopy:** ISIC 2024 / HAM10000 (Melanoma border saliency)
- **Brain MRI:** BraTS 2023 (Volumetric multi-parametric neuro-oncology)
coupled with a 4-condition reader study protocol (Conditions A, B, C, D).
