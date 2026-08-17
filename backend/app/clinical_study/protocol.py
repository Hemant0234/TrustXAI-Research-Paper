import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ClinicianStudyCondition(BaseModel):
    condition_id: str
    code: str  # A, B, C, D
    name: str
    description: str
    features_shown: List[str]

STUDY_CONDITIONS: List[ClinicianStudyCondition] = [
    ClinicianStudyCondition(
        condition_id="COND-A",
        code="A",
        name="Prediction Only (Standard AI Output)",
        description="Displays model predicted diagnosis and top probability without visual explanation.",
        features_shown=["Predicted Label", "Top Probability"]
    ),
    ClinicianStudyCondition(
        condition_id="COND-B",
        code="B",
        name="Prediction + Grad-CAM (Single Conventional Saliency)",
        description="Standard single-explainer baseline heatmap overlay.",
        features_shown=["Predicted Label", "Probability", "Grad-CAM Saliency Map"]
    ),
    ClinicianStudyCondition(
        condition_id="COND-C",
        code="C",
        name="Prediction + Hybrid XAI (Multi-Explainer Fusion)",
        description="Displays unified fused explanation with explainer agreement breakdown.",
        features_shown=["Predicted Label", "Probability", "Fused Saliency Map", "Explainer Agreement Map"]
    ),
    ClinicianStudyCondition(
        condition_id="COND-D",
        code="D",
        name="TrustXAI-Med (Hybrid XAI + XQI + Uncertainty + Reliability)",
        description="Full decision support: Fused Saliency + Predictive Uncertainty + 7-Dimension XQI + Evidence-based Reliability.",
        features_shown=["Predicted Label", "Predictive Uncertainty Gauge", "Fused Saliency Map", "XQI Metric Breakdown", "Reliability Evidence Factors", "Trust Recommendation"]
    )
]

class ClinicianResponse(BaseModel):
    participant_id: str
    participant_role: str  # "Radiologist", "Attending Physician", "Resident", "Medical AI Researcher"
    case_id: str
    condition_code: str  # A, B, C, D
    diagnostic_decision: str
    diagnostic_confidence: int = Field(..., ge=1, le=100)
    clinician_trust_score: int = Field(..., ge=1, le=100)
    decision_time_seconds: float
    explanation_utility_rating: int = Field(..., ge=1, le=5)
    clinical_feedback: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

# In-memory research response store
MOCK_CLINICAL_RESPONSES: List[ClinicianResponse] = [
    ClinicianResponse(
        participant_id="RAD-01",
        participant_role="Radiologist",
        case_id="TX-2048",
        condition_code="D",
        diagnostic_decision="Pneumonia (Right Lower Lobe)",
        diagnostic_confidence=95,
        clinician_trust_score=92,
        decision_time_seconds=14.2,
        explanation_utility_rating=5,
        clinical_feedback="XQI and agreement map gave immediate verification that the heatmap was not catching scapular artifact."
    ),
    ClinicianResponse(
        participant_id="RAD-02",
        participant_role="Radiologist",
        case_id="TX-2047",
        condition_code="D",
        diagnostic_decision="Cardiomegaly (Questionable, Requested Lateral View)",
        diagnostic_confidence=72,
        clinician_trust_score=35,
        decision_time_seconds=22.8,
        explanation_utility_rating=5,
        clinical_feedback="The 'Review Required' reliability badge and explainer disagreement warned me away from accepting the 93% AI confidence blindly."
    ),
    ClinicianResponse(
        participant_id="RAD-03",
        participant_role="Resident",
        case_id="TX-2047",
        condition_code="B",
        diagnostic_decision="Cardiomegaly",
        diagnostic_confidence=90,
        clinician_trust_score=85,
        decision_time_seconds=8.5,
        explanation_utility_rating=3,
        clinical_feedback="Grad-CAM alone seemed okay on the heart border, but in retrospect I overtrusted it."
    ),
    ClinicianResponse(
        participant_id="RAD-04",
        participant_role="Attending Physician",
        case_id="TX-2049",
        condition_code="D",
        diagnostic_decision="Pleural Effusion (Left Hemithorax)",
        diagnostic_confidence=88,
        clinician_trust_score=89,
        decision_time_seconds=16.4,
        explanation_utility_rating=5,
        clinical_feedback="High explanation quality helped confirm marginal effusion despite moderate AI probability."
    )
]

class StudyBenchmarkSummary(BaseModel):
    condition: str
    condition_name: str
    mean_diagnostic_accuracy: float
    mean_clinician_trust: float
    mean_decision_time: float
    overreliance_on_incorrect_ai: float
    clinician_satisfaction: float

STUDY_BENCHMARK_RESULTS: List[StudyBenchmarkSummary] = [
    StudyBenchmarkSummary(
        condition="Condition A",
        condition_name="Prediction Only",
        mean_diagnostic_accuracy=79.4,
        mean_clinician_trust=58.2,
        mean_decision_time=24.5,
        overreliance_on_incorrect_ai=34.2,
        clinician_satisfaction=61.0
    ),
    StudyBenchmarkSummary(
        condition="Condition B",
        condition_name="Prediction + Grad-CAM",
        mean_diagnostic_accuracy=82.1,
        mean_clinician_trust=69.8,
        mean_decision_time=19.8,
        overreliance_on_incorrect_ai=28.5,
        clinician_satisfaction=72.4
    ),
    StudyBenchmarkSummary(
        condition="Condition C",
        condition_name="Prediction + Hybrid XAI",
        mean_diagnostic_accuracy=86.7,
        mean_clinician_trust=78.4,
        mean_decision_time=17.2,
        overreliance_on_incorrect_ai=16.8,
        clinician_satisfaction=81.9
    ),
    StudyBenchmarkSummary(
        condition="Condition D",
        condition_name="TrustXAI-Med (Full Pipeline)",
        mean_diagnostic_accuracy=92.3,
        mean_clinician_trust=88.7,
        mean_decision_time=14.6,
        overreliance_on_incorrect_ai=7.4,
        clinician_satisfaction=94.1
    )
]
