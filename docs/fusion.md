# Hybrid Explanation Fusion Engine

## Mathematical Formulation
TrustXAI-Med avoids naive arithmetic averaging ($S_{\text{fused}} \neq \frac{1}{N}\sum S_i$). Instead, the baseline fusion strategy incorporates:
1. **Robust Percentile Saliency Normalization:**
   $$\hat{M}_i(x, y) = \frac{\text{clip}(M_i(x, y), 0, P_{99.5}) - \min}{\max - \min}$$
2. **Pairwise Spatial Correlation Matrix:**
   $$\rho(M_a, M_b) = \frac{\sum (M_a - \bar{M}_a)(M_b - \bar{M}_b)}{\sqrt{\sum (M_a - \bar{M}_a)^2 \sum (M_b - \bar{M}_b)^2}}$$
3. **Adaptive Attribution Weights:**
   $$w_i \propto (0.4 \cdot \text{Faithfulness}_i + 0.3 \cdot \text{Stability}_i + 0.3 \cdot \text{Robustness}_i) \cdot \bar{\rho}_i$$
4. **Spatial Agreement and Disagreement Maps:**
   $$\text{Disagreement}(x, y) = \sum_{i=1}^N w_i \left( \hat{M}_i(x, y) - \bar{M}_{\text{weighted}}(x, y) \right)^2$$
   $$\text{Agreement}(x, y) = \bar{M}_{\text{weighted}}(x, y) \cdot (1 - \text{Disagreement}(x, y))$$
5. **Predictive Uncertainty Gating:**
   $$\text{FusionConfidence} = \bar{\rho}_{\text{overall}} \cdot (1 - 0.4 \cdot \text{UncertaintyScore})$$
