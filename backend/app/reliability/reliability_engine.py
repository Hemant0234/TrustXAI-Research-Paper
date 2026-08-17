from typing import List, Dict, Optional
from app.schemas.cases import ReliabilityAssessment, XQIDimensions, UncertaintyResult, FusionResult

class ExplanationReliabilityEngine:
    """
    Explanation Reliability Engine.
    Determines whether a generated explanation can be scientifically trusted
    by synthesizing explanation quality, cross-method consensus, perturbation stability,
    and predictive uncertainty.
    """

    @staticmethod
    def evaluate_reliability(
        confidence_prob: float,
        uncertainty: UncertaintyResult,
        xqi: XQIDimensions,
        fusion: FusionResult,
        localization_score: Optional[float] = None
    ) -> ReliabilityAssessment:
        # Reliability formula combining XQI (40%), Agreement (25%), Stability (20%), Uncertainty penalty (15%)
        base_xqi = xqi.overall
        agreement_perc = fusion.overall_agreement * 100.0
        stability_score = xqi.stability
        uncertainty_penalty = uncertainty.score * 100.0  # High uncertainty reduces reliability

        raw_reliability = (
            0.40 * base_xqi +
            0.25 * agreement_perc +
            0.20 * stability_score +
            0.15 * (100.0 - uncertainty_penalty)
        )

        reliability_score = round(max(0.0, min(100.0, raw_reliability)), 1)

        # Evidence evaluation
        evidence_positive: List[str] = []
        evidence_concerns: List[str] = []

        # Check agreement
        if fusion.overall_agreement >= 0.80:
            evidence_positive.append("Multiple XAI methods exhibit strong spatial agreement across key pathology regions.")
        elif fusion.overall_agreement >= 0.65:
            evidence_concerns.append("Moderate explainer divergence observed between gradient and perturbation attribution maps.")
        else:
            evidence_concerns.append("Severe spatial disagreement across explainers; attribution maps highlight conflicting anatomical structures.")

        # Check stability
        if xqi.stability >= 80.0:
            evidence_positive.append("Explanation remains stable under input perturbations (Gaussian noise, contrast shifts).")
        else:
            evidence_concerns.append("Explanation displays high instability under minor photometric and geometric perturbations.")

        # Check localization
        if localization_score is not None:
            if localization_score >= 85.0:
                evidence_positive.append("High overlap with expert radiologist localization annotations.")
            elif localization_score >= 60.0:
                evidence_concerns.append("Partial overlap with expected anatomical lesion boundaries.")
            else:
                evidence_concerns.append("Poor localization: attribution concentrates on peripheral or non-lesion artifacts.")
        else:
            evidence_concerns.append("Human ground-truth localization annotation is not available for this case.")

        # Check uncertainty alignment
        if uncertainty.score <= 0.30:
            evidence_positive.append("Low predictive uncertainty and well-calibrated class distribution.")
        else:
            evidence_concerns.append(f"Elevated predictive uncertainty ({uncertainty.level.upper()}) detected in model logits.")

        # Check faithfulness
        if xqi.faithfulness >= 80.0:
            evidence_positive.append("High model faithfulness: mask removal significantly reduces target class probability.")
        else:
            evidence_concerns.append("Sub-optimal faithfulness: salient pixels do not strongly govern model output.")

        # Level determination
        if reliability_score >= 80.0 and len(evidence_concerns) <= 1:
            level = "RELIABLE"
            verdict = "HIGH RELIABILITY"
            should_trust = True
            rec = "The available evaluation evidence indicates a high-reliability explanation under the current research configuration."
        elif reliability_score >= 60.0:
            level = "CAUTION"
            verdict = "MODERATE RELIABILITY — CAUTION"
            should_trust = False
            rec = "Explanation exhibits partial consistency; supplementary clinician review is recommended before relying on attribution."
        else:
            level = "REVIEW REQUIRED"
            verdict = "UNRELIABLE EXPLANATION — REVIEW REQUIRED"
            should_trust = False
            rec = "Explanation fails multiple reliability criteria (disagreement, instability, or uncertainty). Do NOT rely on this explanation."

        return ReliabilityAssessment(
            score=reliability_score,
            level=level,
            trust_verdict=verdict,
            evidence_positive=evidence_positive,
            evidence_concerns=evidence_concerns,
            should_trust_explanation=should_trust,
            clinical_recommendation=rec
        )
