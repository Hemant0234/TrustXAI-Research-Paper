from typing import Dict, Optional, Any
from app.schemas.cases import XQIDimensions

class XQICalculator:
    """
    Explanation Quality Index (XQI) Calculator.
    Computes a rigorous, multi-dimensional quantitative quality score
    incorporating model faithfulness, clinical localization, perturbation robustness,
    algorithmic stability, consistency, human agreement, and predictive uncertainty alignment.
    """

    DEFAULT_WEIGHTS = {
        "faithfulness": 0.20,
        "localization": 0.20,
        "robustness": 0.15,
        "stability": 0.15,
        "consistency": 0.10,
        "human_agreement": 0.10,
        "uncertainty_alignment": 0.10
    }

    @staticmethod
    def calculate_xqi(
        faithfulness: float,
        localization: Optional[float],
        robustness: float,
        stability: float,
        consistency: float,
        human_agreement: Optional[float],
        uncertainty_alignment: float,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> XQIDimensions:
        weights = dict(custom_weights or XQICalculator.DEFAULT_WEIGHTS)
        
        # Available metrics dictionary
        values: Dict[str, Optional[float]] = {
            "faithfulness": faithfulness,
            "localization": localization,
            "robustness": robustness,
            "stability": stability,
            "consistency": consistency,
            "human_agreement": human_agreement,
            "uncertainty_alignment": uncertainty_alignment
        }

        # Dynamically renormalize weights across present (non-None) metrics
        active_weights = {k: w for k, w in weights.items() if values[k] is not None}
        total_active_weight = sum(active_weights.values())

        if total_active_weight > 1e-6:
            normalized_weights = {k: w / total_active_weight for k, w in active_weights.items()}
        else:
            normalized_weights = {k: 1.0 / len(active_weights) for k in active_weights}

        # Weighted calculation
        overall_xqi = sum(values[k] * normalized_weights[k] for k in active_weights)
        overall_xqi = round(max(0.0, min(100.0, overall_xqi)), 1)

        # Categorize research status
        if overall_xqi >= 80.0:
            status = "HIGH QUALITY — RESEARCH THRESHOLD"
        elif overall_xqi >= 60.0:
            status = "MODERATE QUALITY — CAUTION ADVISED"
        else:
            status = "LOW QUALITY — INSUFFICIENT RELIABILITY"

        # Explicit mathematical formula representation
        formula_parts = [f"{w:.2f} × {k.capitalize()}" for k, w in normalized_weights.items()]
        formula_str = "XQI = " + " + ".join(formula_parts)

        return XQIDimensions(
            overall=overall_xqi,
            faithfulness=round(faithfulness, 1),
            localization=round(localization, 1) if localization is not None else None,
            robustness=round(robustness, 1),
            stability=round(stability, 1),
            consistency=round(consistency, 1),
            human_agreement=round(human_agreement, 1) if human_agreement is not None else None,
            uncertainty_alignment=round(uncertainty_alignment, 1),
            weights={k: round(w, 3) for k, w in normalized_weights.items()},
            status=status,
            mathematical_formulation=formula_str,
            is_research_baseline=True
        )
