import math
from typing import Dict, Any, Tuple
from app.schemas.cases import UncertaintyResult

class UncertaintyEstimator:
    """
    Research module for estimating diagnostic prediction uncertainty, entropy,
    and calibration alignment in medical AI models.
    """

    @staticmethod
    def calculate_entropy(probabilities: Dict[str, float]) -> float:
        """Calculates normalized Shannon Entropy in range [0, 1]."""
        num_classes = max(2, len(probabilities))
        max_entropy = math.log(num_classes)
        
        entropy = 0.0
        for p in probabilities.values():
            if p > 1e-9:
                entropy -= p * math.log(p)
                
        normalized_entropy = max(0.0, min(1.0, entropy / max_entropy))
        return round(normalized_entropy, 4)

    @staticmethod
    def estimate_uncertainty(
        probabilities: Dict[str, float],
        top_prob: float,
        calibration_error: float = 0.045,
        mc_variance: float = 0.015
    ) -> UncertaintyResult:
        """
        Computes composite uncertainty score and assesses confidence vs. uncertainty alignment.
        """
        entropy = UncertaintyEstimator.calculate_entropy(probabilities)
        margin = 1.0 - top_prob
        composite_score = 0.5 * entropy + 0.3 * margin + 0.2 * (mc_variance * 5.0)
        composite_score = round(max(0.0, min(1.0, composite_score)), 3)

        if composite_score < 0.30:
            level = "low"
            interp = "Low predictive uncertainty. The predictive distribution is sharply peaked."
        elif composite_score < 0.55:
            level = "moderate"
            interp = "Moderate predictive uncertainty. Secondary differential diagnoses carry minor probability mass."
        elif composite_score < 0.75:
            level = "high"
            interp = "High predictive uncertainty. Significant dispersion across candidate classes."
        else:
            level = "very_high"
            interp = "Very high predictive uncertainty. Decision should be approached with extreme clinician oversight."

        # Alignment
        if top_prob >= 0.85:
            if composite_score <= 0.30:
                alignment = "HIGH"
            elif composite_score <= 0.55:
                alignment = "MODERATE"
            else:
                alignment = "LOW"
        elif top_prob >= 0.65:
            if 0.25 <= composite_score <= 0.60:
                alignment = "HIGH"
            else:
                alignment = "MODERATE"
        else:
            if composite_score >= 0.50:
                alignment = "HIGH"
            else:
                alignment = "MODERATE"

        return UncertaintyResult(
            score=composite_score,
            level=level,
            entropy=entropy,
            calibration_error=round(calibration_error, 4),
            monte_carlo_variance=round(mc_variance, 4),
            interpretation=interp,
            alignment_with_confidence=alignment
        )
