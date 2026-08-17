import json
import csv
import io
from typing import Dict, Any, List
from app.schemas.cases import CaseAnalysisResponse

class ResearchReportGenerator:
    """
    Generates structured, provenance-traceable research reports for paper appendices,
    audit trails, and clinical study documentation.
    """

    @staticmethod
    def generate_markdown_report(case: CaseAnalysisResponse) -> str:
        md = f"""# TrustXAI-Med Research Case Report

**Document Type:** Computational XAI Audit & Evaluation Dossier  
**Case Identifier:** `{case.case_id}`  
**Modality:** {case.modality}  
**Dataset:** {case.dataset}  
**Diagnostic Model:** {case.model_name}  
**Execution Mode:** {'DEMO / SYNTHETIC SIMULATION' if case.is_demo else 'REAL RESEARCH INFERENCE'}  

---

## 1. Diagnostic Prediction & Uncertainty

| Metric | Measured Value | Interpretation |
| :--- | :--- | :--- |
| **Predicted Label** | **{case.prediction.label}** | Primary model diagnosis |
| **Prediction Confidence** | **{case.prediction.probability * 100:.1f}%** | Softmax class probability $P(Y=\hat{{y}} \mid X)$ |
| **Predictive Uncertainty** | **{case.uncertainty.level.upper()}** (Score: {case.uncertainty.score:.3f}) | Composite entropy & margin dispersion |
| **Normalized Entropy** | {case.uncertainty.entropy:.3f} | Shannon information entropy across candidate classes |
| **Calibration Error (ECE)**| {case.uncertainty.calibration_error:.4f} | Expected difference between confidence and empirical accuracy |
| **Uncertainty Alignment** | **{case.uncertainty.alignment_with_confidence}** | Confidence $\leftrightarrow$ Uncertainty coherence |

*Clinical Note:* {case.uncertainty.interpretation}

---

## 2. Multi-XAI Explainer Evaluation

| Explainer Method | Faithfulness | Localization | Stability | Robustness | Consistency |
| :--- | :---: | :---: | :---: | :---: | :---: |
"""
        for name, exp in case.explanations.items():
            loc_str = f"{exp.localization:.1f}" if exp.localization is not None else "N/A"
            md += f"| **{name}** | {exp.faithfulness:.1f} | {loc_str} | {exp.stability:.1f} | {exp.robustness:.1f} | {exp.consistency:.1f} |\n"

        md += f"""
---

## 3. Explanation Fusion & Cross-Method Consensus

- **Fusion Strategy:** {case.fusion.fusion_strategy}
- **Overall Cross-Method Spatial Agreement:** **{case.fusion.overall_agreement * 100:.1f}%**
- **Fusion Confidence Index:** **{case.fusion.fusion_confidence * 100:.1f}%**

### Dynamic Attribution Weights:
"""
        for m, w in case.fusion.weights_used.items():
            md += f"- `{m}`: {w * 100:.1f}%\n"

        md += f"""
### Pairwise Explainer Spatial Agreement:
"""
        for pair, corr in case.fusion.pairwise_agreement.items():
            md += f"- **{pair}**: {corr * 100:.1f}%\n"

        md += f"""
---

## 4. Explanation Quality Index (XQI)

**Overall XQI Score:** **{case.xqi.overall:.1f} / 100**  
**Quality Status:** `{case.xqi.status}`  
**Formulation:** `{case.xqi.mathematical_formulation}`  

### Dimensional Breakdown:
- **Faithfulness:** {case.xqi.faithfulness:.1f} / 100 (Weight: {case.xqi.weights.get('faithfulness', 0):.2f})
- **Localization:** {f"{case.xqi.localization:.1f} / 100" if case.xqi.localization is not None else "N/A"} (Weight: {case.xqi.weights.get('localization', 0):.2f})
- **Robustness:** {case.xqi.robustness:.1f} / 100 (Weight: {case.xqi.weights.get('robustness', 0):.2f})
- **Stability:** {case.xqi.stability:.1f} / 100 (Weight: {case.xqi.weights.get('stability', 0):.2f})
- **Consistency:** {case.xqi.consistency:.1f} / 100 (Weight: {case.xqi.weights.get('consistency', 0):.2f})
- **Uncertainty Alignment:** {case.xqi.uncertainty_alignment:.1f} / 100 (Weight: {case.xqi.weights.get('uncertainty_alignment', 0):.2f})

---

## 5. Explanation Reliability Assessment ("Should I Trust This?")

**Reliability Score:** **{case.reliability.score:.1f} / 100**  
**Research Trust Verdict:** **{case.reliability.trust_verdict}**  
**Decision Support Action:** **{case.reliability.level}**  

### Supporting Evidence Factors:
"""
        for ev in case.reliability.evidence_positive:
            md += f"- [x] **CONFIRMED:** {ev}\n"

        if case.reliability.evidence_concerns:
            md += "\n### Potential Concerns & Risk Indicators:\n"
            for ev in case.reliability.evidence_concerns:
                md += f"- [!] **CAUTION:** {ev}\n"

        md += f"""
### System Recommendation:
> {case.reliability.clinical_recommendation}

---

## Research Disclaimer
*TrustXAI-Med is a research evaluation prototype. It is not intended for patient diagnosis, treatment planning, or direct autonomous clinical decision-making.*
"""
        return md

    @staticmethod
    def generate_json_report(case: CaseAnalysisResponse) -> str:
        data = case.model_dump()
        return json.dumps(data, indent=2)

    @staticmethod
    def generate_csv_summary(cases: List[CaseAnalysisResponse]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Case ID", "Modality", "Dataset", "Model", "Predicted Label",
            "Confidence (%)", "Uncertainty Level", "Uncertainty Score",
            "Entropy", "ECE", "XQI Overall", "Reliability Score",
            "Reliability Level", "Overall Agreement (%)", "Stability (%)"
        ])
        
        for c in cases:
            writer.writerow([
                c.case_id,
                c.modality,
                c.dataset,
                c.model_name,
                c.prediction.label,
                round(c.prediction.probability * 100, 1),
                c.uncertainty.level,
                c.uncertainty.score,
                c.uncertainty.entropy,
                c.uncertainty.calibration_error,
                c.xqi.overall,
                c.reliability.score,
                c.reliability.level,
                round(c.fusion.overall_agreement * 100, 1),
                c.xqi.stability
            ])
            
        return output.getvalue()
