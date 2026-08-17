from typing import Dict, List, Any, Optional
from app.schemas.cases import SaliencyMapData, FusionResult
from app.fusion.normalization import normalize_saliency_matrix
from app.fusion.agreement import (
    compute_pairwise_spatial_correlation,
    compute_agreement_and_disagreement_maps
)

class ExplanationFusionEngine:
    """
    Quality-Aware, Agreement-Weighted, Uncertainty-Adaptive Explanation Fusion Engine.
    Combines heterogeneous XAI representations into a unified, reliable clinical saliency map.
    """

    def __init__(self, baseline_strategy: str = "Uncertainty-Weighted Quality-Aware Baseline"):
        self.strategy_name = baseline_strategy

    def fuse_explanations(
        self,
        explanations: Dict[str, SaliencyMapData],
        uncertainty_score: float = 0.15,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> FusionResult:
        method_names = list(explanations.keys())
        if not method_names:
            raise ValueError("No explanations provided for fusion.")

        # 1. Normalize all saliency matrices
        normalized_maps: Dict[str, List[List[float]]] = {}
        for name, exp in explanations.items():
            normalized_maps[name] = normalize_saliency_matrix(exp.matrix)

        # 2. Compute pairwise spatial correlations
        pairwise_agreement: Dict[str, float] = {}
        agreement_scores_per_method: Dict[str, List[float]] = {m: [] for m in method_names}
        
        for i in range(len(method_names)):
            for j in range(i + 1, len(method_names)):
                m1, m2 = method_names[i], method_names[j]
                corr = compute_pairwise_spatial_correlation(normalized_maps[m1], normalized_maps[m2])
                pair_key = f"{m1} ↔ {m2}"
                pairwise_agreement[pair_key] = round(corr, 4)
                agreement_scores_per_method[m1].append(corr)
                agreement_scores_per_method[m2].append(corr)

        # Calculate mean agreement for each method
        mean_agreements = {
            m: sum(scores) / len(scores) if scores else 0.5
            for m, scores in agreement_scores_per_method.items()
        }

        # 3. Calculate dynamic weights if not custom provided
        if custom_weights is not None:
            total = sum(custom_weights.get(m, 1.0) for m in method_names)
            weights = {m: round(custom_weights.get(m, 1.0) / (total + 1e-8), 4) for m in method_names}
        else:
            raw_weights = {}
            for m in method_names:
                exp = explanations[m]
                quality_factor = (exp.faithfulness * 0.4 + exp.stability * 0.3 + exp.robustness * 0.3) / 100.0
                agreement_factor = mean_agreements[m]
                raw_weights[m] = max(0.05, quality_factor * agreement_factor)
                
            total_raw = sum(raw_weights.values())
            weights = {m: round(raw_weights[m] / (total_raw + 1e-8), 4) for m in method_names}

        # 4. Generate fused saliency map
        ordered_maps = [normalized_maps[m] for m in method_names]
        ordered_weights = [weights[m] for m in method_names]
        
        h = len(ordered_maps[0])
        w = len(ordered_maps[0][0])
        fused_sum = [[0.0 for _ in range(w)] for _ in range(h)]

        for map_mat, wt in zip(ordered_maps, ordered_weights):
            for r in range(h):
                for c in range(w):
                    fused_sum[r][c] += map_mat[r][c] * wt

        fused_matrix = normalize_saliency_matrix(fused_sum)

        # 5. Generate agreement and disagreement maps
        agr_map, disagr_map = compute_agreement_and_disagreement_maps(ordered_maps, ordered_weights)

        # 6. Overall metrics
        all_corrs = list(pairwise_agreement.values())
        overall_agreement = sum(all_corrs) / len(all_corrs) if all_corrs else 0.85
        
        # Fusion confidence is high when agreement is high and prediction uncertainty is low
        fusion_confidence = max(0.0, min(1.0, overall_agreement * (1.0 - 0.4 * uncertainty_score)))

        return FusionResult(
            fused_matrix=[[round(float(v), 4) for v in row] for row in fused_matrix],
            agreement_matrix=[[round(float(v), 4) for v in row] for row in agr_map],
            disagreement_matrix=[[round(float(v), 4) for v in row] for row in disagr_map],
            overall_agreement=round(overall_agreement, 4),
            fusion_confidence=round(fusion_confidence, 4),
            weights_used=weights,
            pairwise_agreement=pairwise_agreement,
            fusion_strategy=self.strategy_name
        )
