import math
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel, Field
from app.schemas.cases import SaliencyMapData
from app.fusion.normalization import normalize_saliency_matrix

class PerturbationRequest(BaseModel):
    case_id: str
    perturbation_type: str = Field(..., description="gaussian_noise, brightness, contrast, blur, rotation, crop")
    intensity: float = Field(0.2, description="Normalized severity parameter [0.0, 1.0]")
    xai_method: str = "Grad-CAM++"

class PerturbationResponse(BaseModel):
    case_id: str
    perturbation_type: str
    intensity: float
    original_prediction: str
    original_confidence: float
    perturbed_prediction: str
    perturbed_confidence: float
    perturbed_uncertainty: float
    original_xqi: float
    perturbed_xqi: float
    explanation_similarity: float
    localization_consistency: float
    perturbation_stability_score: float
    perturbed_matrix: List[List[float]]
    difference_matrix: List[List[float]]
    interpretation: str

class RobustnessLabEngine:
    """
    Simulates adversarial & clinical noise perturbations to measure
    explanation stability and prediction sensitivity.
    """

    @staticmethod
    def run_perturbation(
        base_matrix: List[List[float]],
        base_pred: str,
        base_conf: float,
        base_xqi: float,
        perturbation_type: str,
        intensity: float
    ) -> PerturbationResponse:
        grid_h = len(base_matrix)
        grid_w = len(base_matrix[0]) if grid_h > 0 else 0
        severity = float(max(0.0, min(1.0, intensity)))

        perturbed_mat = []
        diff_mat = []

        if perturbation_type == "gaussian_noise":
            conf_drop = severity * 0.08
            sim_decay = 0.95 - (severity * 0.28)
        elif perturbation_type == "blur":
            conf_drop = severity * 0.05
            sim_decay = 0.98 - (severity * 0.22)
        elif perturbation_type == "contrast":
            conf_drop = severity * 0.04
            sim_decay = 0.96 - (severity * 0.18)
        elif perturbation_type == "brightness":
            conf_drop = severity * 0.03
            sim_decay = 0.97 - (severity * 0.15)
        elif perturbation_type == "rotation":
            conf_drop = severity * 0.07
            sim_decay = 0.94 - (severity * 0.32)
        elif perturbation_type == "crop":
            conf_drop = severity * 0.12
            sim_decay = 0.92 - (severity * 0.35)
        else:
            conf_drop = 0.0
            sim_decay = 1.0

        for r in range(grid_h):
            p_row = []
            d_row = []
            for c in range(grid_w):
                orig_v = base_matrix[r][c]
                # Simulated perturbation shift
                shift = severity * 0.25 * math.sin(r * 0.8 + c * 0.7 + severity * 5.0)
                new_v = max(0.0, min(1.0, orig_v + shift))
                diff_v = abs(orig_v - new_v)
                p_row.append(round(new_v, 4))
                d_row.append(round(diff_v, 4))
            perturbed_mat.append(p_row)
            diff_mat.append(d_row)

        perturbed_conf = round(max(0.40, min(0.99, base_conf - conf_drop)), 3)
        similarity = round(max(0.1, min(1.0, sim_decay)), 3)
        loc_consistency = round(max(0.1, min(1.0, similarity * 0.96)), 3)
        perturbed_xqi = round(max(20.0, min(100.0, base_xqi * (0.5 + 0.5 * similarity))), 1)
        stability_score = round(similarity * 100.0, 1)
        perturbed_unc = round(min(0.95, (1.0 - perturbed_conf) + severity * 0.2), 3)

        if stability_score >= 85.0:
            interp = f"High stability ({stability_score}%). Explanation core features remain invariant under {perturbation_type.replace('_', ' ')}."
        elif stability_score >= 65.0:
            interp = f"Moderate stability ({stability_score}%). Noticeable peripheral dispersion under {perturbation_type.replace('_', ' ')}."
        else:
            interp = f"Low stability ({stability_score}%). Explanation suffers significant semantic drift under {perturbation_type.replace('_', ' ')}."

        return PerturbationResponse(
            case_id="TX-PERTURB",
            perturbation_type=perturbation_type,
            intensity=severity,
            original_prediction=base_pred,
            original_confidence=base_conf,
            perturbed_prediction=base_pred if perturbed_conf > 0.50 else "Uncertain / Artifact",
            perturbed_confidence=perturbed_conf,
            perturbed_uncertainty=perturbed_unc,
            original_xqi=base_xqi,
            perturbed_xqi=perturbed_xqi,
            explanation_similarity=similarity,
            localization_consistency=loc_consistency,
            perturbation_stability_score=stability_score,
            perturbed_matrix=perturbed_mat,
            difference_matrix=diff_mat,
            interpretation=interp
        )
