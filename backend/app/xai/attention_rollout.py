import math
from typing import Dict, Any, Optional, List
from app.xai.base import BaseExplainer
from app.schemas.cases import SaliencyMapData

class AttentionRolloutExplainer(BaseExplainer):
    """
    Attention Rollout / Transformer Attribution (Abnar & Zuidema, 2020).
    Tracks information flow across multi-head self-attention layers.
    """

    def __init__(self):
        super().__init__(name="Attention Rollout", category="multi-head transformer attention flow")

    def generate_explanation(
        self,
        image_array: Any,
        model: Any,
        target_class: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> SaliencyMapData:
        pass

    @staticmethod
    def create_mock_saliency(
        center_y: float = 0.51,
        center_x: float = 0.62,
        radius: float = 0.23,
        noise_level: float = 0.10,
        grid_size: int = 32,
        faithfulness: float = 80.0,
        localization: Optional[float] = 86.0,
        stability: float = 79.0,
        robustness: float = 75.0,
        consistency: float = 83.0,
        human_agreement: Optional[float] = None
    ) -> SaliencyMapData:
        cy, cx = center_y * grid_size, center_x * grid_size
        r = radius * grid_size
        r_sq_2 = 2.0 * (r ** 2)

        mat = []
        for y in range(grid_size):
            row = []
            for x in range(grid_size):
                dist_sq = (x - cx) ** 2 + (y - cy) ** 2
                val = math.exp(-dist_sq / r_sq_2)
                # Patch-like attention token blockiness
                block_val = 0.8 if ((x // 4) + (y // 4)) % 2 == 0 else 1.0
                val = min(1.0, val * block_val)
                row.append(round(val, 4))
            mat.append(row)

        return SaliencyMapData(
            method="Attention Rollout",
            matrix=mat,
            grid_size=[grid_size, grid_size],
            faithfulness=faithfulness,
            localization=localization,
            stability=stability,
            robustness=robustness,
            consistency=consistency,
            human_agreement=human_agreement,
            provenance={
                "head_fusion": "Mean Across 12 Self-Attention Heads",
                "residual_weight": 0.5,
                "layer_depth": 12,
                "simulated": True
            }
        )
