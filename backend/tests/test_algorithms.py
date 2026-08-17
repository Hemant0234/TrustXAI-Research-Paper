import pytest
import numpy as np
from app.quality.xqi import XQICalculator
from app.fusion.normalization import normalize_saliency_matrix
from app.fusion.agreement import compute_pairwise_spatial_correlation, compute_agreement_and_disagreement_maps
from app.fusion.fusion_engine import ExplanationFusionEngine
from app.models.uncertainty import UncertaintyEstimator
from app.reliability.reliability_engine import ExplanationReliabilityEngine
from app.services.synthetic_data import SyntheticCaseLibrary
from app.robustness.perturbation import RobustnessLabEngine

def test_xqi_normalization_and_dynamic_weights():
    # Test with full metrics
    xqi_full = XQICalculator.calculate_xqi(
        faithfulness=90.0,
        localization=95.0,
        robustness=85.0,
        stability=88.0,
        consistency=92.0,
        human_agreement=80.0,
        uncertainty_alignment=85.0
    )
    assert 0 <= xqi_full.overall <= 100
    assert xqi_full.status == "HIGH QUALITY — RESEARCH THRESHOLD"
    assert sum(xqi_full.weights.values()) == pytest.approx(1.0, 0.01)

    # Test with missing human_agreement (None)
    xqi_no_human = XQICalculator.calculate_xqi(
        faithfulness=88.0,
        localization=93.0,
        robustness=81.0,
        stability=85.0,
        consistency=90.0,
        human_agreement=None,
        uncertainty_alignment=86.0
    )
    assert xqi_no_human.human_agreement is None
    assert "human_agreement" not in xqi_no_human.weights
    assert sum(xqi_no_human.weights.values()) == pytest.approx(1.0, 0.01)
    assert xqi_no_human.overall >= 80.0

def test_saliency_normalization():
    uniform_zeros = np.zeros((32, 32))
    norm_zeros = normalize_saliency_matrix(uniform_zeros)
    assert norm_zeros.shape == (32, 32)
    assert np.all(norm_zeros == 0)

    random_mat = np.random.uniform(10.0, 50.0, (32, 32))
    norm_mat = normalize_saliency_matrix(random_mat)
    assert norm_mat.min() >= 0.0
    assert norm_mat.max() <= 1.0

def test_pairwise_agreement_and_fusion():
    mat_a = np.ones((32, 32))
    mat_b = np.ones((32, 32))
    corr_identical = compute_pairwise_spatial_correlation(mat_a, mat_b)
    assert 0.0 <= corr_identical <= 1.0

    agr_map, disagr_map = compute_agreement_and_disagreement_maps([mat_a, mat_b], [0.5, 0.5])
    assert agr_map.shape == (32, 32)
    assert disagr_map.shape == (32, 32)

def test_flagship_killer_demo_case_tx2047():
    """
    CRITICAL RESEARCH VERIFICATION:
    Case TX-2047 has 93.2% confidence, but must have low reliability & REVIEW REQUIRED status.
    """
    case_tx2047 = SyntheticCaseLibrary.get_case_tx2047()
    assert case_tx2047.prediction.probability >= 0.90
    assert case_tx2047.uncertainty.level in ["moderate", "high", "very_high"]
    assert case_tx2047.xqi.overall < 60.0
    assert case_tx2047.reliability.score < 60.0
    assert case_tx2047.reliability.level == "REVIEW REQUIRED"
    assert case_tx2047.reliability.should_trust_explanation is False
    assert len(case_tx2047.reliability.evidence_concerns) > 0

def test_reliable_case_tx2048():
    case_tx2048 = SyntheticCaseLibrary.get_case_tx2048()
    assert case_tx2048.prediction.probability >= 0.90
    assert case_tx2048.uncertainty.level == "low"
    assert case_tx2048.xqi.overall >= 80.0
    assert case_tx2048.reliability.score >= 85.0
    assert case_tx2048.reliability.level == "RELIABLE"
    assert case_tx2048.reliability.should_trust_explanation is True

def test_robustness_perturbations():
    base_matrix = [[0.5] * 32 for _ in range(32)]
    resp = RobustnessLabEngine.run_perturbation(
        base_matrix=base_matrix,
        base_pred="Pneumonia",
        base_conf=0.914,
        base_xqi=87.0,
        perturbation_type="gaussian_noise",
        intensity=0.3
    )
    assert resp.perturbation_stability_score > 0.0
    assert len(resp.perturbed_matrix) == 32
    assert len(resp.difference_matrix) == 32
