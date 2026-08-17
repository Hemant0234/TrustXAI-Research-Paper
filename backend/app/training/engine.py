import os
import json
import time
import math
import random
import threading
import datetime
from typing import Dict, List, Any, Optional
from PIL import Image
from pydantic import BaseModel
from app.db.database import DatabaseManager

class TrainingConfig(BaseModel):
    dataset_path: str
    dataset_name: str = "Medical Dataset"
    architecture: str = "densenet121"
    epochs: int = 10
    batch_size: int = 16
    learning_rate: float = 0.0001
    weight_decay: float = 0.01
    seed: int = 42
    use_patient_split: bool = True
    output_dir: str = "./checkpoints"

class TrainingStatus(BaseModel):
    job_id: str
    status: str  # queued, running, completed, failed
    current_epoch: int
    total_epochs: int
    train_loss: Optional[float] = None
    val_loss: Optional[float] = None
    train_acc: Optional[float] = None
    val_acc: Optional[float] = None
    val_f1: Optional[float] = None
    val_auc: Optional[float] = None
    val_ece: Optional[float] = None
    learning_rate: float
    device: str
    elapsed_seconds: float
    history: List[Dict[str, Any]]
    error_message: Optional[str] = None
    checkpoint_path: Optional[str] = None

class RealTrainingEngine:
    """
    Asynchronous PyTorch Training Engine for Diagnostic Medical Imaging Backbones.
    """
    _active_jobs: Dict[str, Dict[str, Any]] = {}
    _lock = threading.Lock()

    @classmethod
    def get_job_status(cls, job_id: str) -> Optional[TrainingStatus]:
        with cls._lock:
            job = cls._active_jobs.get(job_id)
            if not job:
                # Check database
                db_run = DatabaseManager.get_training_run(job_id)
                if db_run:
                    return TrainingStatus(
                        job_id=db_run["id"],
                        status=db_run["status"],
                        current_epoch=db_run["current_epoch"],
                        total_epochs=db_run["total_epochs"],
                        train_loss=db_run["train_loss"],
                        val_loss=db_run["val_loss"],
                        train_acc=db_run["train_acc"],
                        val_acc=db_run["val_acc"],
                        learning_rate=0.0001,
                        device=db_run["device"],
                        elapsed_seconds=0.0,
                        history=db_run["history"]
                    )
                return None

            elapsed = time.time() - job["start_time"]
            return TrainingStatus(
                job_id=job_id,
                status=job["status"],
                current_epoch=job["current_epoch"],
                total_epochs=job["total_epochs"],
                train_loss=job.get("train_loss"),
                val_loss=job.get("val_loss"),
                train_acc=job.get("train_acc"),
                val_acc=job.get("val_acc"),
                val_f1=job.get("val_f1"),
                val_auc=job.get("val_auc"),
                val_ece=job.get("val_ece"),
                learning_rate=job["learning_rate"],
                device=job["device"],
                elapsed_seconds=round(elapsed, 1),
                history=job.get("history", []),
                error_message=job.get("error_message"),
                checkpoint_path=job.get("checkpoint_path")
            )

    @classmethod
    def start_training(cls, config: TrainingConfig) -> str:
        job_id = f"train_{int(time.time())}_{random.randint(1000, 9999)}"
        
        with cls._lock:
            cls._active_jobs[job_id] = {
                "job_id": job_id,
                "status": "running",
                "current_epoch": 0,
                "total_epochs": config.epochs,
                "learning_rate": config.learning_rate,
                "device": "Detecting...",
                "start_time": time.time(),
                "history": [],
                "config": config.dict()
            }

        thread = threading.Thread(target=cls._run_worker, args=(job_id, config), daemon=True)
        thread.start()
        return job_id

    @classmethod
    def _run_worker(cls, job_id: str, config: TrainingConfig):
        try:
            import torch
            import torch.nn as nn
            import torch.optim as optim
            from torch.utils.data import Dataset, DataLoader
            import torchvision.transforms as transforms
            import torchvision.models as models
            has_torch = True
        except ImportError:
            has_torch = False

        if not has_torch:
            with cls._lock:
                cls._active_jobs[job_id]["status"] = "failed"
                cls._active_jobs[job_id]["error_message"] = "PyTorch is not available. Please install PyTorch."
            return

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        device_name = f"CUDA — {torch.cuda.get_device_name(0)}" if torch.cuda.is_available() else "CPU"
        
        with cls._lock:
            cls._active_jobs[job_id]["device"] = device_name

        # 1. Discover classes from dataset directory
        root = config.dataset_path
        classes = sorted([d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d)) and not d.startswith('.')])
        if not classes:
            classes = ["ClassA", "ClassB"]
        num_classes = len(classes)

        # 2. Build Dataset
        class SimpleImageFolderDataset(Dataset):
            def __init__(self, items, transform=None):
                self.items = items
                self.transform = transform

            def __len__(self):
                return len(self.items)

            def __getitem__(self, idx):
                img_path, label = self.items[idx]
                try:
                    with Image.open(img_path) as img:
                        img = img.convert('RGB')
                        if self.transform:
                            img = self.transform(img)
                        return img, label
                except Exception:
                    # Return zero tensor if image fails
                    return torch.zeros((3, 224, 224)), label

        all_items = []
        for label_idx, c_name in enumerate(classes):
            c_dir = os.path.join(root, c_name)
            if os.path.isdir(c_dir):
                for f in os.listdir(c_dir):
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                        all_items.append((os.path.join(c_dir, f), label_idx))

        random.seed(config.seed)
        random.shuffle(all_items)

        n_total = len(all_items)
        if n_total == 0:
            with cls._lock:
                cls._active_jobs[job_id]["status"] = "failed"
                cls._active_jobs[job_id]["error_message"] = f"No images found in {root}"
            return

        n_train = max(1, int(n_total * 0.70))
        n_val = max(1, int(n_total * 0.15))
        train_items = all_items[:n_train]
        val_items = all_items[n_train:n_train + n_val]

        train_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        val_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        train_loader = DataLoader(SimpleImageFolderDataset(train_items, train_transform), batch_size=config.batch_size, shuffle=True)
        val_loader = DataLoader(SimpleImageFolderDataset(val_items, val_transform), batch_size=config.batch_size, shuffle=False)

        # 3. Model Architecture (DenseNet-121)
        model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
        num_features = model.classifier.in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(num_features, num_classes)
        )
        model = model.to(device)

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.AdamW(model.parameters(), lr=config.learning_rate, weight_decay=config.weight_decay)
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=config.epochs)

        best_val_acc = 0.0
        os.makedirs(config.output_dir, exist_ok=True)
        checkpoint_path = os.path.join(config.output_dir, f"{job_id}_best.pth")

        # 4. Training Loop
        for epoch in range(1, config.epochs + 1):
            model.train()
            running_loss = 0.0
            correct_train = 0
            total_train = 0

            for images, labels in train_loader:
                images, labels = images.to(device), labels.to(device)
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                running_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_train += (preds == labels).sum().item()
                total_train += images.size(0)

            scheduler.step()
            train_loss = running_loss / max(1, total_train)
            train_acc = (correct_train / max(1, total_train)) * 100.0

            # Validation Loop
            model.eval()
            val_running_loss = 0.0
            correct_val = 0
            total_val = 0

            with torch.no_grad():
                for images, labels in val_loader:
                    images, labels = images.to(device), labels.to(device)
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                    val_running_loss += loss.item() * images.size(0)
                    _, preds = torch.max(outputs, 1)
                    correct_val += (preds == labels).sum().item()
                    total_val += images.size(0)

            val_loss = val_running_loss / max(1, total_val)
            val_acc = (correct_val / max(1, total_val)) * 100.0

            epoch_record = {
                "epoch": epoch,
                "train_loss": round(train_loss, 4),
                "val_loss": round(val_loss, 4),
                "train_acc": round(train_acc, 2),
                "val_acc": round(val_acc, 2),
                "learning_rate": scheduler.get_last_lr()[0]
            }

            # Save best checkpoint
            if val_acc >= best_val_acc:
                best_val_acc = val_acc
                torch.save({
                    "model_state_dict": model.state_dict(),
                    "architecture": config.architecture,
                    "num_classes": num_classes,
                    "classes": classes,
                    "val_acc": val_acc,
                    "epoch": epoch
                }, checkpoint_path)

            with cls._lock:
                cls._active_jobs[job_id]["current_epoch"] = epoch
                cls._active_jobs[job_id]["train_loss"] = round(train_loss, 4)
                cls._active_jobs[job_id]["val_loss"] = round(val_loss, 4)
                cls._active_jobs[job_id]["train_acc"] = round(train_acc, 2)
                cls._active_jobs[job_id]["val_acc"] = round(val_acc, 2)
                cls._active_jobs[job_id]["history"].append(epoch_record)
                cls._active_jobs[job_id]["checkpoint_path"] = checkpoint_path

            # Update Database
            DatabaseManager.save_training_run({
                "id": job_id,
                "experiment_id": f"EXP-{job_id[-4:]}",
                "model_id": f"model_{job_id}",
                "dataset_id": config.dataset_name,
                "status": "running" if epoch < config.epochs else "completed",
                "current_epoch": epoch,
                "total_epochs": config.epochs,
                "train_loss": train_loss,
                "val_loss": val_loss,
                "train_acc": train_acc,
                "val_acc": val_acc,
                "device": device_name,
                "history": cls._active_jobs[job_id]["history"],
                "created_at": datetime.datetime.fromtimestamp(cls._active_jobs[job_id]["start_time"]).isoformat(),
                "finished_at": datetime.datetime.utcnow().isoformat() if epoch == config.epochs else None
            })

        # Finalize
        with cls._lock:
            cls._active_jobs[job_id]["status"] = "completed"

        # Register model in database
        DatabaseManager.save_model(
            model_id=f"TXAI-{config.architecture.upper()}-{job_id[-4:]}",
            name=f"Trained {config.architecture} ({config.dataset_name})",
            architecture=config.architecture,
            dataset_id=config.dataset_name,
            checkpoint_path=checkpoint_path,
            num_classes=num_classes,
            classes=classes,
            val_metric=round(best_val_acc, 2),
            val_metric_name="Accuracy",
            status="Ready",
            config=config.dict()
        )
