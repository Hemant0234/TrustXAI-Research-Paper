import os
import re
import random
from typing import Dict, List, Tuple, Any, Optional
from PIL import Image
from pydantic import BaseModel
from app.db.database import DatabaseManager

class DatasetScanResult(BaseModel):
    dataset_name: str
    root_path: str
    total_images: int
    classes: List[str]
    class_distribution: Dict[str, int]
    train_count: int
    val_count: int
    test_count: int
    patient_level_split_applied: bool
    unique_patients_detected: Optional[int]
    corrupted_images: List[str]
    class_imbalance_warning: Optional[str]
    sample_images: List[Dict[str, str]]

class DatasetManager:
    """
    Scans, validates, and prepares multi-image datasets with patient-aware splitting.
    """

    VALID_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif'}

    @staticmethod
    def extract_patient_id(filename: str) -> str:
        """
        Extracts patient identifier from standard medical filenames:
        e.g., 'patient01234_study1_view1.png' -> 'patient01234'
        e.g., 'p1024_01.jpg' -> 'p1024'
        e.g., 'ISIC_0024312.jpg' -> 'ISIC_0024312'
        """
        base = os.path.splitext(filename)[0]
        # Match common patient prefixes
        match = re.match(r'^(patient\d+|p\d+|sub\d+|case_\d+|ISIC_\d+)', base, re.IGNORECASE)
        if match:
            return match.group(1).lower()
        # Fallback: token before first underscore or hyphen
        parts = re.split(r'[_ -]', base)
        return parts[0].lower() if parts else base.lower()

    @classmethod
    def scan_and_split_dataset(
        cls,
        root_path: str,
        dataset_name: str = "Custom Medical Dataset",
        modality: str = "Chest Radiograph",
        train_pct: float = 0.70,
        val_pct: float = 0.15,
        test_pct: float = 0.15,
        random_seed: int = 42,
        enforce_patient_split: bool = True
    ) -> DatasetScanResult:
        if not os.path.exists(root_path):
            raise FileNotFoundError(f"Dataset path does not exist: {root_path}")

        random.seed(random_seed)
        corrupted_files = []
        classes_found = []
        images_by_class: Dict[str, List[Dict[str, Any]]] = {}

        # 1. Inspect directory structure
        subdirs = [d for d in os.listdir(root_path) if os.path.isdir(os.path.join(root_path, d))]
        
        # Check if already pre-split into train/val/test
        is_pre_split = set(subdirs).intersection({'train', 'val', 'valid', 'test'})

        if is_pre_split:
            # Multi-split folder
            classes_set = set()
            for split_name in subdirs:
                split_dir = os.path.join(root_path, split_name)
                for c_name in os.listdir(split_dir):
                    c_path = os.path.join(split_dir, c_name)
                    if os.path.isdir(c_path):
                        classes_set.add(c_name)
                        if c_name not in images_by_class:
                            images_by_class[c_name] = []
                        for f in os.listdir(c_path):
                            ext = os.path.splitext(f)[1].lower()
                            if ext in cls.VALID_EXTENSIONS:
                                f_full = os.path.join(c_path, f)
                                images_by_class[c_name].append({
                                    "path": f_full,
                                    "filename": f,
                                    "patient_id": cls.extract_patient_id(f),
                                    "split": "train" if "train" in split_name else ("val" if "val" in split_name else "test")
                                })
            classes_found = sorted(list(classes_set))
        else:
            # Flat class directories
            for d in sorted(subdirs):
                c_path = os.path.join(root_path, d)
                classes_found.append(d)
                images_by_class[d] = []
                for f in os.listdir(c_path):
                    ext = os.path.splitext(f)[1].lower()
                    if ext in cls.VALID_EXTENSIONS:
                        f_full = os.path.join(c_path, f)
                        # Verify readability
                        try:
                            with Image.open(f_full) as img:
                                img.verify()
                            images_by_class[d].append({
                                "path": f_full,
                                "filename": f,
                                "patient_id": cls.extract_patient_id(f)
                            })
                        except Exception:
                            corrupted_files.append(f_full)

        # 2. Compute distribution
        distribution = {c: len(images_by_class.get(c, [])) for c in classes_found}
        total_images = sum(distribution.values())

        if total_images == 0:
            raise ValueError(f"No valid medical images found in {root_path}")

        # 3. Patient-Aware Splitting
        train_count = 0
        val_count = 0
        test_count = 0
        unique_patients = set()

        for c_name, img_list in images_by_class.items():
            if is_pre_split:
                for img_info in img_list:
                    unique_patients.add(img_info["patient_id"])
                    if img_info.get("split") == "train":
                        train_count += 1
                    elif img_info.get("split") == "val":
                        val_count += 1
                    else:
                        test_count += 1
            else:
                # Group images by patient ID
                patient_map: Dict[str, List[Dict[str, Any]]] = {}
                for img_info in img_list:
                    pid = img_info["patient_id"]
                    unique_patients.add(pid)
                    if pid not in patient_map:
                        patient_map[pid] = []
                    patient_map[pid].append(img_info)

                patients = list(patient_map.keys())
                random.shuffle(patients)

                n_p = len(patients)
                n_train_p = int(n_p * train_pct)
                n_val_p = int(n_p * val_pct)

                train_patients = set(patients[:n_train_p])
                val_patients = set(patients[n_train_p:n_train_p + n_val_p])
                test_patients = set(patients[n_train_p + n_val_p:])

                for pid, p_imgs in patient_map.items():
                    if pid in train_patients:
                        train_count += len(p_imgs)
                    elif pid in val_patients:
                        val_count += len(p_imgs)
                    else:
                        test_count += len(p_imgs)

        # 4. Imbalance warning
        imbalance_warning = None
        if classes_found and distribution:
            max_c = max(distribution.values())
            min_c = min(distribution.values())
            if min_c > 0 and (max_c / min_c) > 3.0:
                imbalance_warning = f"Severe class imbalance detected: max class has {max_c} images, min class has {min_c} images (ratio {max_c/min_c:.1f}:1). Weighted loss recommended."

        # 5. Samples for UI
        sample_images = []
        for c in classes_found[:4]:
            if images_by_class.get(c):
                sample_images.append({
                    "class": c,
                    "filename": images_by_class[c][0]["filename"],
                    "path": images_by_class[c][0]["path"]
                })

        # 6. Persist to SQLite
        dataset_id = f"ds_{re.sub(r'[^a-zA-Z0-9]', '_', dataset_name.lower())[:20]}"
        DatabaseManager.save_dataset(
            dataset_id=dataset_id,
            name=dataset_name,
            modality=modality,
            path=root_path,
            classes=classes_found,
            num_samples=total_images,
            train_count=train_count,
            val_count=val_count,
            test_count=test_count,
            patient_level_split=enforce_patient_split,
            status="Ready"
        )

        return DatasetScanResult(
            dataset_name=dataset_name,
            root_path=root_path,
            total_images=total_images,
            classes=classes_found,
            class_distribution=distribution,
            train_count=train_count,
            val_count=val_count,
            test_count=test_count,
            patient_level_split_applied=enforce_patient_split,
            unique_patients_detected=len(unique_patients),
            corrupted_images=corrupted_files,
            class_imbalance_warning=imbalance_warning,
            sample_images=sample_images
        )
