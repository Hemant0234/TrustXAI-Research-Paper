# Explanation Quality Index (XQI) Specification

## Conceptual Definition
The **Explanation Quality Index (XQI)** is a multidimensional quantitative metric designed to evaluate the clinical trustworthiness and algorithmic fidelity of an AI-generated explanation.

$$XQI = \sum_{d \in D} \tilde{w}_d \cdot S_d$$

where $S_d \in [0, 100]$ represents the normalized score for dimension $d$, and $\tilde{w}_d$ are dynamically normalized weights:

$$\tilde{w}_d = \frac{w_d}{\sum_{k \in D_{\text{available}}} w_k}$$

---

## The Seven Quality Dimensions

| Dimension | Default Weight ($w_d$) | Measurement Protocol | Provenance / Ground Truth |
| :--- | :---: | :--- | :--- |
| **Faithfulness ($S_F$)** | 0.20 | Sensitivity-n pixel removal & logit drop | Model gradients & logits |
| **Localization ($S_L$)** | 0.20 | Intersection-over-Union (IoU) with expert mask | CheXlocalize / Radiologist Segmentations |
| **Robustness ($S_R$)** | 0.15 | Saliency SSIM under noise & sensor blur | Perturbation Lab Engine |
| **Stability ($S_S$)** | 0.15 | Saliency Cosine variance across sampling seeds | Stochastic Re-evaluation |
| **Consistency ($S_C$)** | 0.10 | Multi-explainer pairwise Pearson correlation | Explainer Ensemble Consensus |
| **Human Agreement ($S_H$)**| 0.10 | Certified clinician reader rating (1-5 Likert) | Clinical Reader Study |
| **Uncertainty Alignment ($S_U$)** | 0.10 | Coherence between entropy, ECE, & confidence | Predictive Entropy & Calibration |

---

## Status Classification
- **$\ge 80.0$ / 100:** `HIGH QUALITY — RESEARCH THRESHOLD`
- **$60.0 – 79.9$ / 100:** `MODERATE QUALITY — CAUTION ADVISED`
- **$< 60.0$ / 100:** `LOW QUALITY — INSUFFICIENT RELIABILITY`

---

## Dynamic Missing Data Handling
When expert localization annotations or human agreement reader logs are unavailable for a specific case or dataset slice, the system sets $S_d = \text{None}$ and dynamically redistributes $w_d$ across the remaining available dimensions.
