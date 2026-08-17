from typing import List, Dict, Any
from pydantic import BaseModel

class AblationCondition(BaseModel):
    condition_id: str
    name: str
    description: str
    accuracy: float
    auc_roc: float
    calibration_ece: float
    faithfulness: float
    localization: float
    stability: float
    robustness: float
    xqi: float
    reliability: float

ABLATION_STUDY_DATA: List[AblationCondition] = [
    AblationCondition(
        condition_id="ABL-01",
        name="Baseline (Prediction Only)",
        description="Standard DenseNet-121 model without explainers or uncertainty estimation.",
        accuracy=88.4,
        auc_roc=0.912,
        calibration_ece=0.078,
        faithfulness=0.0,
        localization=0.0,
        stability=0.0,
        robustness=0.0,
        xqi=0.0,
        reliability=0.0
    ),
    AblationCondition(
        condition_id="ABL-02",
        name="+ Single Explainer (Grad-CAM++)",
        description="Adds gradient-weighted class activation mapping.",
        accuracy=88.4,
        auc_roc=0.912,
        calibration_ece=0.078,
        faithfulness=78.2,
        localization=76.5,
        stability=74.2,
        robustness=71.0,
        xqi=72.4,
        reliability=68.8
    ),
    AblationCondition(
        condition_id="ABL-03",
        name="+ Multi-XAI Ensemble (No Fusion)",
        description="Generates 4 explainers independently without unified synthesis.",
        accuracy=88.4,
        auc_roc=0.912,
        calibration_ece=0.078,
        faithfulness=81.5,
        localization=79.8,
        stability=77.6,
        robustness=74.3,
        xqi=76.7,
        reliability=73.2
    ),
    AblationCondition(
        condition_id="ABL-04",
        name="+ Uniform Mean Fusion",
        description="Combines 4 heatmaps via naive arithmetic averaging.",
        accuracy=88.4,
        auc_roc=0.912,
        calibration_ece=0.078,
        faithfulness=83.0,
        localization=81.8,
        stability=82.5,
        robustness=79.2,
        xqi=79.2,
        reliability=77.0
    ),
    AblationCondition(
        condition_id="ABL-05",
        name="+ Quality-Aware Adaptive Fusion",
        description="Weights explainers by per-method faithfulness, stability, and spatial agreement.",
        accuracy=88.4,
        auc_roc=0.912,
        calibration_ece=0.078,
        faithfulness=86.8,
        localization=88.4,
        stability=89.1,
        robustness=85.6,
        xqi=84.5,
        reliability=84.0
    ),
    AblationCondition(
        condition_id="ABL-06",
        name="Full TrustXAI-Med (+ Uncertainty & XQI)",
        description="Full pipeline: Quality-Aware Fusion + Predictive Uncertainty Gating + 7-Dimension XQI Calibration.",
        accuracy=88.4,
        auc_roc=0.912,
        calibration_ece=0.045,
        faithfulness=88.5,
        localization=92.7,
        stability=93.8,
        robustness=88.9,
        xqi=87.6,
        reliability=92.1
    )
]
