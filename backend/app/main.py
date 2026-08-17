import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.schemas.cases import (
    CaseAnalysisResponse,
    SaliencyMapData,
    FusionResult,
    XQIDimensions,
    ReliabilityAssessment
)
from app.services.synthetic_data import SyntheticCaseLibrary
from app.fusion.fusion_engine import ExplanationFusionEngine
from app.quality.xqi import XQICalculator
from app.reliability.reliability_engine import ExplanationReliabilityEngine
from app.robustness.perturbation import RobustnessLabEngine, PerturbationRequest, PerturbationResponse
from app.datasets.registry import DATASET_REGISTRY, DatasetMetadata
from app.models.registry import MODEL_REGISTRY, ModelMetadata
from app.experiments.registry import BENCHMARK_EXPERIMENTS, ExperimentEntry
from app.experiments.ablation import ABLATION_STUDY_DATA, AblationCondition
from app.clinical_study.protocol import (
    STUDY_CONDITIONS,
    MOCK_CLINICAL_RESPONSES,
    STUDY_BENCHMARK_RESULTS,
    ClinicianStudyCondition,
    ClinicianResponse,
    StudyBenchmarkSummary
)
from app.reports.generator import ResearchReportGenerator

app = FastAPI(
    title="TrustXAI-Med API",
    description="Uncertainty-Aware Hybrid XAI for Medical Image Diagnosis Research Platform",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory case cache
cases_db = SyntheticCaseLibrary.get_all_cases()
clinical_responses_db = list(MOCK_CLINICAL_RESPONSES)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TrustXAI-Med Backend",
        "version": "1.0.0",
        "mode": "Demo Mode (Real Research Extensions Enabled)",
        "cases_loaded": len(cases_db),
        "disclaimer": "Research prototype for evaluation purposes only. Not intended for clinical diagnosis."
    }

# ================= CASES & ANALYZE =================
@app.get("/api/cases", response_model=List[Dict[str, Any]])
def list_cases():
    results = []
    for c in cases_db.values():
        results.append({
            "case_id": c.case_id,
            "modality": c.modality,
            "dataset": c.dataset,
            "model_name": c.model_name,
            "predicted_label": c.prediction.label,
            "confidence": round(c.prediction.probability * 100, 1),
            "uncertainty_level": c.uncertainty.level,
            "uncertainty_score": c.uncertainty.score,
            "xqi_score": c.xqi.overall,
            "reliability_score": c.reliability.score,
            "reliability_level": c.reliability.level,
            "overall_agreement": round(c.fusion.overall_agreement * 100, 1),
            "is_demo": c.is_demo
        })
    return results

@app.get("/api/cases/{case_id}", response_model=CaseAnalysisResponse)
def get_case_analysis(case_id: str):
    case = cases_db.get(case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
    return case

class CustomFusionRequest(BaseModel):
    case_id: str
    weights: Dict[str, float]

@app.post("/api/fusion/custom", response_model=FusionResult)
def recalculate_custom_fusion(req: CustomFusionRequest):
    case = cases_db.get(req.case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {req.case_id} not found.")
    
    fusion_engine = ExplanationFusionEngine(baseline_strategy="Custom User-Weighted Saliency Fusion")
    return fusion_engine.fuse_explanations(
        explanations=case.explanations,
        uncertainty_score=case.uncertainty.score,
        custom_weights=req.weights
    )

class CustomXQIRequest(BaseModel):
    case_id: str
    weights: Dict[str, float]

@app.post("/api/quality/xqi/recalculate", response_model=Dict[str, Any])
def recalculate_xqi(req: CustomXQIRequest):
    case = cases_db.get(req.case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {req.case_id} not found.")
    
    new_xqi = XQICalculator.calculate_xqi(
        faithfulness=case.xqi.faithfulness,
        localization=case.xqi.localization,
        robustness=case.xqi.robustness,
        stability=case.xqi.stability,
        consistency=case.xqi.consistency,
        human_agreement=case.xqi.human_agreement,
        uncertainty_alignment=case.xqi.uncertainty_alignment,
        custom_weights=req.weights
    )
    
    # Also update reliability
    new_reliability = ExplanationReliabilityEngine.evaluate_reliability(
        confidence_prob=case.prediction.probability,
        uncertainty=case.uncertainty,
        xqi=new_xqi,
        fusion=case.fusion,
        localization_score=case.xqi.localization
    )
    
    return {
        "xqi": new_xqi,
        "reliability": new_reliability
    }

# ================= ROBUSTNESS =================
@app.post("/api/robustness/perturb", response_model=PerturbationResponse)
def run_perturbation(req: PerturbationRequest):
    case = cases_db.get(req.case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {req.case_id} not found.")
    
    # Choose explainer matrix or fused matrix
    if req.xai_method in case.explanations:
        base_mat = case.explanations[req.xai_method].matrix
    else:
        base_mat = case.fusion.fused_matrix

    return RobustnessLabEngine.run_perturbation(
        base_matrix=base_mat,
        base_pred=case.prediction.label,
        base_conf=case.prediction.probability,
        base_xqi=case.xqi.overall,
        perturbation_type=req.perturbation_type,
        intensity=req.intensity
    )

# ================= DATASETS & MODELS =================
@app.get("/api/datasets", response_model=List[DatasetMetadata])
def get_datasets():
    return DATASET_REGISTRY

@app.get("/api/models", response_model=List[ModelMetadata])
def get_models():
    return MODEL_REGISTRY

# ================= EXPERIMENTS & ABLATION =================
@app.get("/api/experiments", response_model=List[ExperimentEntry])
def get_experiments():
    return BENCHMARK_EXPERIMENTS

@app.get("/api/experiments/ablation", response_model=List[AblationCondition])
def get_ablation_study():
    return ABLATION_STUDY_DATA

# ================= CLINICAL STUDY =================
@app.get("/api/clinical-study/conditions", response_model=List[ClinicianStudyCondition])
def get_study_conditions():
    return STUDY_CONDITIONS

@app.get("/api/clinical-study/benchmarks", response_model=List[StudyBenchmarkSummary])
def get_study_benchmarks():
    return STUDY_BENCHMARK_RESULTS

@app.get("/api/clinical-study/responses", response_model=List[ClinicianResponse])
def get_clinical_responses():
    return clinical_responses_db

@app.post("/api/clinical-study/responses", response_model=Dict[str, Any])
def submit_clinical_response(response: ClinicianResponse):
    clinical_responses_db.append(response)
    return {
        "status": "success",
        "message": f"Response from {response.participant_id} recorded successfully.",
        "total_responses": len(clinical_responses_db)
    }

# ================= RESEARCH REPORTS =================
@app.get("/api/reports/{case_id}/markdown")
def get_markdown_report(case_id: str):
    case = cases_db.get(case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
    md_content = ResearchReportGenerator.generate_markdown_report(case)
    return Response(content=md_content, media_type="text/markdown")

@app.get("/api/reports/{case_id}/json")
def get_json_report(case_id: str):
    case = cases_db.get(case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
    json_content = ResearchReportGenerator.generate_json_report(case)
    return Response(content=json_content, media_type="application/json")

@app.get("/api/reports/csv")
def get_csv_report():
    cases_list = list(cases_db.values())
    csv_content = ResearchReportGenerator.generate_csv_summary(cases_list)
    return Response(content=csv_content, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=trustxai_research_summary.csv"
    })
