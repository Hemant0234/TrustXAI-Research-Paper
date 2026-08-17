# TrustXAI-Med Research Methodology

## 1. Core Paradigm: Multi-XAI Ensemble & Quality Quantification

Modern medical AI systems often operate on a fragile assumption: that displaying a single saliency heatmap (e.g., Grad-CAM) alongside a softmax prediction constitutes sufficient transparency. In practice, individual explainers exhibit significant discordance, high susceptibility to gradient noise, and vulnerability to adversarial or clinical perturbations.

**TrustXAI-Med** fundamentally reframes explainable medical AI around a central research thesis:
> **Do not rely on a single explanation method. Combine complementary XAI paradigms into a unified, uncertainty-gated explanation and quantitatively score its clinical trustworthiness before clinician reliance.**

```text
  [ MEDICAL IMAGE ] ──► [ AI DIAGNOSIS ] ──► [ MULTIPLE XAI METHODS ] ──► [ UNIFIED EXPLANATION ]
                                                       │
                                                       ▼
  [ CLINICIAN TRUST ] ◄── [ EXPLANATION QUALITY (XQI) ] ◄── [ UNCERTAINTY SCORE ]
```

---

## 2. The Four Complementary Explanation Techniques

TrustXAI-Med harnesses four distinct, axiomatic XAI families to capture spatial activations, marginal feature contributions, path-integral gradients, and transformer attention flows:

| Method | Family | Mathematical Mechanism | Clinical Diagnostic Role |
| :--- | :--- | :--- | :--- |
| **Grad-CAM++** | Gradient-Weighted Class Activation | $\alpha_{k}^{c} = \sum_{i,j} \frac{\frac{\partial^2 Y^c}{\partial (A_{i,j}^k)^2}}{2 \frac{\partial^2 Y^c}{\partial (A_{i,j}^k)^2} + \sum_{a,b} A_{a,b}^k \frac{\partial^3 Y^c}{\partial (A_{a,b}^k)^3}} \text{ReLU}\left(\frac{\partial Y^c}{\partial A_{i,j}^k}\right)$ | Coarse anatomical localization; highlights discriminative tissue pathology in CNN backbones (DenseNet, ResNet). |
| **SHAP** | Game-Theoretic Shapley Values | $\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$ | Estimates exact marginal credit allocation across superpixels; ensures local accuracy and consistency. |
| **Integrated Gradients (IG)** | Path-Integral Axiomatic Attribution | $\text{IG}_i(x) = (x_i - x_i') \times \int_{0}^{1} \frac{\partial F(x' + \alpha(x - x'))}{\partial x_i} d\alpha$ | Satisfies Completeness and Implementation Invariance; delivers fine-grained pixel-level boundary attributions. |
| **Attention Rollout** | Multi-Head Self-Attention Flow | $\tilde{A}^{(l)} = 0.5 A^{(l)} + 0.5 I$, $\quad R^{(L)} = \prod_{l=1}^{L} \tilde{A}^{(l)}$ | Interprets token-to-token attention patterns in Vision Transformers (ViT, Swin) across self-attention layers. |

---

## 3. Uncertainty-Aware Confidence Scoring

A critical source of diagnostic automation bias is **overreliance on prediction confidence**:
$$\text{Model Confidence} = \max_{k} P(y = k \mid x)$$

High confidence does *not* imply high certainty. A model may assign 93% probability to a diagnosis while operating in an out-of-distribution regime with high entropy and severe explainer discordance.

TrustXAI-Med operationalizes **Predictive Uncertainty Gating**:
1. **Normalized Shannon Entropy:**
   $$\mathcal{H}_{\text{norm}}(P) = -\frac{1}{\ln(K)} \sum_{k=1}^K P(y = k \mid x) \ln(P(y = k \mid x))$$
2. **Expected Calibration Error (ECE) Adjustment:**
   $$\text{UncertaintyScore} = 0.5 \cdot \mathcal{H}_{\text{norm}} + 0.3 \cdot (1 - \text{TopConfidence}) + 0.2 \cdot \text{Variance}_{\text{MC}}$$
3. **Alignment Assessment:**
   - **High Alignment:** Peaked probability + low entropy ($\text{Confidence} \uparrow$, $\text{Uncertainty} \downarrow$).
   - **Low Alignment (Anomaly):** Peaked probability + high entropy or explainer discordance (e.g. Case TX-2047).

---

## 4. The Explanation Quality Index (XQI)

The central methodological contribution of TrustXAI-Med is the **Explanation Quality Index (XQI)**—a composite metric in $[0, 100]$ that replaces subjective visual inspection with an empirical rating:

$$XQI = \sum_{d \in D} \tilde{w}_d \cdot S_d$$

### The Seven Evaluated Dimensions:
1. **Faithfulness ($S_{\text{faith}}$):** Sensitivity-n / pixel-perturbation correlation measuring whether masked high-attribution features decrease model output.
2. **Localization ($S_{\text{loc}}$):** Intersection over Union (IoU) and Pointing Game hit-rate against radiologist ground-truth masks (CheXlocalize).
3. **Robustness ($S_{\text{rob}}$):** SSIM preservation of saliency topologies under Gaussian noise, contrast shifts, and blur.
4. **Algorithmic Stability ($S_{\text{stab}}$):** Attribution consistency across stochastic initialization seeds and Monte Carlo runs.
5. **Cross-Method Consistency ($S_{\text{cons}}$):** Mean pairwise Pearson correlation across all explainers in the ensemble.
6. **Human Agreement ($S_{\text{human}}$):** Standardized Likert consensus from expert clinician reader studies (renormalized when missing).
7. **Uncertainty Alignment ($S_{\text{unc}}$):** Harmonic alignment between explanation consensus and model epistemic certainty.

### Dynamic Weight Renormalization:
When ground-truth segmentations or clinician reader ratings are unavailable, weights dynamically rebalance so $\sum \tilde{w}_d = 1.0$:
$$\tilde{w}_d = \frac{w_d}{\sum_{k \in D_{\text{available}}} w_k}$$

---

## 5. Summary Table: From Explanation to Clinical Decision

```text
┌─────────────────────────┬────────────────────────┬──────────────────────────────────────────┐
│ Prediction Confidence   │ Explanation XQI / Rel. │ Clinical Decision Support Action         │
├─────────────────────────┼────────────────────────┼──────────────────────────────────────────┤
│ High (≥ 85%)            │ High (≥ 80/100)        │ RELIABLE: Validated explanation consensus│
│ High (≥ 85%)            │ Low (< 60/100)         │ REVIEW REQUIRED: High confidence anomaly │
│ Moderate (60–85%)       │ Moderate (60–80/100)   │ CAUTION: Minor differential discordance  │
│ Low (< 60%)             │ Low (< 60/100)         │ REVIEW REQUIRED: Ambiguous scan features │
└─────────────────────────┴────────────────────────┴──────────────────────────────────────────┘
```
