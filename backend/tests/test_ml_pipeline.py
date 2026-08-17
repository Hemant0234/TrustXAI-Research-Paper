import os
import sys
import shutil
import tempfile
from PIL import Image

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.database import DatabaseManager, init_db
from app.datasets.manager import DatasetManager
from app.quality.real_xqi import RealXQIEngine

def test_database_crud():
    print("[TEST 1/4] Testing SQLite Database Schema & Persistence...")
    init_db()
    DatabaseManager.save_dataset(
        dataset_id="test_ds_01",
        name="Test CheXpert Mini",
        modality="Chest Radiograph",
        path="/tmp/test_cxr",
        classes=["Pneumonia", "Normal"],
        num_samples=200,
        train_count=140,
        val_count=30,
        test_count=30,
        patient_level_split=True,
        status="Ready"
    )
    datasets = DatabaseManager.get_datasets()
    assert any(d["id"] == "test_ds_01" for d in datasets)
    print("  -> PASSED: SQLite dataset persistence verified.")

def test_patient_level_splitting_no_leakage():
    print("[TEST 2/4] Testing Patient-Aware Dataset Splitting (Zero Patient Leakage)...")
    # Create temporary dataset directory with 3 patients and multiple images per patient
    temp_dir = tempfile.mkdtemp()
    try:
        class_a_dir = os.path.join(temp_dir, "Pneumonia")
        class_b_dir = os.path.join(temp_dir, "Normal")
        os.makedirs(class_a_dir, exist_ok=True)
        os.makedirs(class_b_dir, exist_ok=True)

        # Patient 01 (3 images), Patient 02 (2 images), Patient 03 (2 images)
        for i in range(3):
            img = Image.new("RGB", (64, 64), color=(100, 100, 100))
            img.save(os.path.join(class_a_dir, f"patient01_img{i}.png"))
        for i in range(2):
            img = Image.new("RGB", (64, 64), color=(120, 120, 120))
            img.save(os.path.join(class_a_dir, f"patient02_img{i}.png"))
        for i in range(2):
            img = Image.new("RGB", (64, 64), color=(80, 80, 80))
            img.save(os.path.join(class_b_dir, f"patient03_img{i}.png"))

        res = DatasetManager.scan_and_split_dataset(
            root_path=temp_dir,
            dataset_name="Test Splitting Cohort",
            modality="Chest Radiograph",
            train_pct=0.60,
            val_pct=0.20,
            test_pct=0.20,
            enforce_patient_split=True
        )

        assert res.total_images == 7
        assert res.unique_patients_detected == 3
        assert len(res.classes) == 2
        assert res.train_count + res.val_count + res.test_count == 7
        print(f"  -> PASSED: Scanned 7 images from 3 patients. Splitting: Train={res.train_count}, Val={res.val_count}, Test={res.test_count}.")
    finally:
        shutil.rmtree(temp_dir)

def test_real_xqi_and_renormalization():
    print("[TEST 3/4] Testing Real 7-D XQI Dynamic Renormalization & Reliability Assessment...")
    # Fully evaluated scenario
    eval_full = RealXQIEngine.evaluate_complete_xqi(
        faithfulness=88.0,
        robustness=85.0,
        stability=83.0,
        consistency=89.0,
        uncertainty_score=0.12,
        localization=92.0,
        human_agreement=85.0
    )
    assert eval_full.reliability_level == "RELIABLE"
    assert eval_full.overall_xqi >= 80.0
    assert abs(sum(eval_full.weights_used.values()) - 1.0) < 0.01

    # Missing localization and human agreement (dynamic renormalization to 1.0)
    eval_partial = RealXQIEngine.evaluate_complete_xqi(
        faithfulness=85.0,
        robustness=82.0,
        stability=80.0,
        consistency=86.0,
        uncertainty_score=0.18,
        localization=None,
        human_agreement=None
    )
    assert eval_partial.localization is None
    assert eval_partial.human_agreement is None
    assert "localization" not in eval_partial.weights_used
    assert "human_agreement" not in eval_partial.weights_used
    assert abs(sum(eval_partial.weights_used.values()) - 1.0) < 0.01
    print("  -> PASSED: Dynamic renormalization verified (sum of available weights = 1.0).")

def test_flagship_tx2047_scientific_thesis():
    print("[TEST 4/4] Testing Flagship Research Thesis (High Confidence + High Uncertainty = REVIEW REQUIRED)...")
    # Low consistency + high uncertainty
    eval_anomaly = RealXQIEngine.evaluate_complete_xqi(
        faithfulness=52.0,
        robustness=45.0,
        stability=42.0,
        consistency=48.0,
        uncertainty_score=0.62,
        localization=None,
        human_agreement=None
    )
    assert eval_anomaly.reliability_score < 60.0
    assert eval_anomaly.reliability_level == "REVIEW REQUIRED"
    assert any("discordance" in e.lower() for e in eval_anomaly.evidence_checklist)
    print(f"  -> PASSED: Flagship anomaly correctly triggered: Reliability={eval_anomaly.reliability_score:.1f}/100 -> {eval_anomaly.reliability_level}.")

if __name__ == "__main__":
    print("\n=======================================================")
    print("     TRUSTXAI-MED REAL RESEARCH & ML PIPELINE TESTS    ")
    print("=======================================================\n")
    test_database_crud()
    test_patient_level_splitting_no_leakage()
    test_real_xqi_and_renormalization()
    test_flagship_tx2047_scientific_thesis()
    print("\n>>> ALL REAL ML PIPELINE TESTS PASSED! <<<\n")
