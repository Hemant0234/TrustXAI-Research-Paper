import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

def test_xqi_and_weights():
    from app.quality.xqi import XQICalculator
    print("[TEST 1/5] Testing XQI Formulation & Dynamic Normalization...")
    xqi_full = XQICalculator.calculate_xqi(90.0, 95.0, 85.0, 88.0, 92.0, 80.0, 85.0)
    assert 0 <= xqi_full.overall <= 100
    assert xqi_full.status == "HIGH QUALITY — RESEARCH THRESHOLD"
    assert abs(sum(xqi_full.weights.values()) - 1.0) < 0.02

    # Missing human agreement
    xqi_no_human = XQICalculator.calculate_xqi(88.0, 93.0, 81.0, 85.0, 90.0, None, 86.0)
    assert xqi_no_human.human_agreement is None
    assert "human_agreement" not in xqi_no_human.weights
    assert abs(sum(xqi_no_human.weights.values()) - 1.0) < 0.02
    print("  -> PASSED: XQI dynamically normalized weights to 1.0 with missing metrics.")

def test_uncertainty_estimator():
    from app.models.uncertainty import UncertaintyEstimator
    print("[TEST 2/5] Testing Predictive Entropy & Calibration Gating...")
    # Sharply peaked distribution
    unc_low = UncertaintyEstimator.estimate_uncertainty({"Pneumonia": 0.914, "Other": 0.086}, 0.914)
    assert unc_low.level == "low"
    assert unc_low.alignment_with_confidence == "HIGH"

    # Dispersed distribution
    unc_high = UncertaintyEstimator.estimate_uncertainty({"A": 0.35, "B": 0.30, "C": 0.20, "D": 0.15}, 0.35)
    assert unc_high.level in ["high", "very_high"]
    print("  -> PASSED: Predictive entropy and uncertainty alignment verified.")

def test_flagship_killer_demo_case_tx2047():
    print("[TEST 3/5] Testing Flagship Killer Demo Case (TX-2047: 93% Conf -> REVIEW REQUIRED)...")
    from app.services.synthetic_data import SyntheticCaseLibrary
    case_tx2047 = SyntheticCaseLibrary.get_case_tx2047()
    assert case_tx2047.prediction.probability >= 0.90, "Case must have high prediction confidence"
    assert case_tx2047.xqi.overall < 60.0, "Case must have low XQI"
    assert case_tx2047.reliability.score < 60.0, "Case must have low reliability"
    assert case_tx2047.reliability.level == "REVIEW REQUIRED", "Must trigger REVIEW REQUIRED"
    assert case_tx2047.reliability.should_trust_explanation is False, "Must NOT trust explanation"
    assert len(case_tx2047.reliability.evidence_concerns) >= 2
    print(f"  -> PASSED: Case TX-2047: Confidence={case_tx2047.prediction.probability*100:.1f}%, Reliability={case_tx2047.reliability.score:.1f}/100 -> Status: {case_tx2047.reliability.level}")

def test_reliable_case_tx2048():
    print("[TEST 4/5] Testing High-Reliability Case (TX-2048: 91% Conf -> RELIABLE)...")
    from app.services.synthetic_data import SyntheticCaseLibrary
    case_tx2048 = SyntheticCaseLibrary.get_case_tx2048()
    assert case_tx2048.prediction.probability >= 0.90
    assert case_tx2048.xqi.overall >= 80.0
    assert case_tx2048.reliability.score >= 85.0
    assert case_tx2048.reliability.level == "RELIABLE"
    assert case_tx2048.reliability.should_trust_explanation is True
    print(f"  -> PASSED: Case TX-2048: Confidence={case_tx2048.prediction.probability*100:.1f}%, Reliability={case_tx2048.reliability.score:.1f}/100 -> Status: {case_tx2048.reliability.level}")

def test_robustness_perturbation():
    print("[TEST 5/5] Testing Perturbation Robustness Simulation...")
    from app.robustness.perturbation import RobustnessLabEngine
    base_matrix = [[0.5] * 32 for _ in range(32)]
    resp = RobustnessLabEngine.run_perturbation(
        base_matrix=base_matrix,
        base_pred="Pneumonia",
        base_conf=0.914,
        base_xqi=87.0,
        perturbation_type="gaussian_noise",
        intensity=0.25
    )
    assert resp.perturbation_stability_score > 0.0
    assert len(resp.perturbed_matrix) == 32
    assert len(resp.difference_matrix) == 32
    print(f"  -> PASSED: Stability score computed: {resp.perturbation_stability_score:.1f}% under {resp.perturbation_type}.")

if __name__ == "__main__":
    print("\n=======================================================")
    print("      TRUSTXAI-MED RESEARCH ALGORITHM TEST SUITE       ")
    print("=======================================================\n")
    try:
        test_xqi_and_weights()
        test_uncertainty_estimator()
        test_flagship_killer_demo_case_tx2047()
        test_reliable_case_tx2048()
        test_robustness_perturbation()
        print("\n>>> ALL 5 RESEARCH ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY! <<<\n")
    except Exception as e:
        print(f"\n[ERROR] Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
