import os
import json
import sqlite3
import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "trustxai.db"))

def get_db_connection() -> sqlite3.Connection:
    """Returns a thread-safe connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite schema for research persistence."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Datasets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        modality TEXT NOT NULL,
        path TEXT NOT NULL,
        classes_json TEXT NOT NULL,
        num_samples INTEGER NOT NULL,
        train_count INTEGER NOT NULL,
        val_count INTEGER NOT NULL,
        test_count INTEGER NOT NULL,
        patient_level_split BOOLEAN DEFAULT 1,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 2. Models & Checkpoints table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        architecture TEXT NOT NULL,
        dataset_id TEXT,
        checkpoint_path TEXT NOT NULL,
        num_classes INTEGER NOT NULL,
        classes_json TEXT NOT NULL,
        val_metric REAL,
        val_metric_name TEXT,
        status TEXT NOT NULL,
        config_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 3. Training Runs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS training_runs (
        id TEXT PRIMARY KEY,
        experiment_id TEXT NOT NULL,
        model_id TEXT NOT NULL,
        dataset_id TEXT NOT NULL,
        status TEXT NOT NULL,
        current_epoch INTEGER NOT NULL,
        total_epochs INTEGER NOT NULL,
        train_loss REAL,
        val_loss REAL,
        train_acc REAL,
        val_acc REAL,
        device TEXT NOT NULL,
        history_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        finished_at TEXT
    )
    """)

    # 4. Inferences & Uncertainty table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inferences (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        image_name TEXT NOT NULL,
        predicted_class TEXT NOT NULL,
        confidence REAL NOT NULL,
        probabilities_json TEXT NOT NULL,
        entropy REAL NOT NULL,
        uncertainty_score REAL NOT NULL,
        uncertainty_level TEXT NOT NULL,
        ece REAL,
        provenance_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 5. XAI & XQI Evaluations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS xai_records (
        id TEXT PRIMARY KEY,
        inference_id TEXT NOT NULL,
        case_id TEXT,
        xqi_overall REAL NOT NULL,
        reliability_score REAL NOT NULL,
        reliability_level TEXT NOT NULL,
        weights_json TEXT NOT NULL,
        pairwise_agreement_json TEXT NOT NULL,
        evidence_json TEXT NOT NULL,
        provenance_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 6. Experiments & Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dataset_name TEXT NOT NULL,
        model_name TEXT NOT NULL,
        config_json TEXT NOT NULL,
        results_json TEXT NOT NULL,
        report_markdown TEXT,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

# Auto-initialize database on import
init_db()

class DatabaseManager:
    """Helper repository for research record CRUD operations."""

    @staticmethod
    def save_dataset(
        dataset_id: str,
        name: str,
        modality: str,
        path: str,
        classes: List[str],
        num_samples: int,
        train_count: int,
        val_count: int,
        test_count: int,
        patient_level_split: bool = True,
        status: str = "Ready"
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT OR REPLACE INTO datasets 
        (id, name, modality, path, classes_json, num_samples, train_count, val_count, test_count, patient_level_split, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dataset_id, name, modality, path, json.dumps(classes),
            num_samples, train_count, val_count, test_count,
            1 if patient_level_split else 0, status, now
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_datasets() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM datasets ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["classes"] = json.loads(d["classes_json"])
            result.append(d)
        conn.close()
        return result

    @staticmethod
    def save_model(
        model_id: str,
        name: str,
        architecture: str,
        dataset_id: str,
        checkpoint_path: str,
        num_classes: int,
        classes: List[str],
        val_metric: Optional[float] = None,
        val_metric_name: str = "Accuracy",
        status: str = "Ready",
        config: Optional[Dict[str, Any]] = None
    ):
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT OR REPLACE INTO models
        (id, name, architecture, dataset_id, checkpoint_path, num_classes, classes_json, val_metric, val_metric_name, status, config_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            model_id, name, architecture, dataset_id, checkpoint_path,
            num_classes, json.dumps(classes), val_metric, val_metric_name,
            status, json.dumps(config or {}), now
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_models() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM models ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            m = dict(r)
            m["classes"] = json.loads(m["classes_json"])
            m["config"] = json.loads(m["config_json"])
            result.append(m)
        conn.close()
        return result

    @staticmethod
    def save_training_run(run_data: Dict[str, Any]):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO training_runs
        (id, experiment_id, model_id, dataset_id, status, current_epoch, total_epochs, train_loss, val_loss, train_acc, val_acc, device, history_json, created_at, finished_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_data["id"], run_data["experiment_id"], run_data["model_id"],
            run_data["dataset_id"], run_data["status"], run_data["current_epoch"],
            run_data["total_epochs"], run_data.get("train_loss"), run_data.get("val_loss"),
            run_data.get("train_acc"), run_data.get("val_acc"), run_data["device"],
            json.dumps(run_data.get("history", [])), run_data["created_at"], run_data.get("finished_at")
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_training_run(run_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM training_runs WHERE id = ?", (run_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        d = dict(row)
        d["history"] = json.loads(d["history_json"])
        conn.close()
        return d
