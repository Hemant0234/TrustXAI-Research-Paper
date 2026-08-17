from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DatasetMetadata(BaseModel):
    id: str
    name: str
    modality: str
    task: str
    num_samples: str
    classes: List[str]
    annotations_type: str
    access_level: str  # Open Research, Credentialed Access Required, Restricted
    role_in_research: str  # Core Primary, Localization Truth, Cross-Domain, External Generalization
    status: str  # Configured (Demo Mode), Real Local Root Connected, Awaiting Credentials
    citation: str
    description: str

DATASET_REGISTRY: List[DatasetMetadata] = [
    DatasetMetadata(
        id="chexpert",
        name="CheXpert",
        modality="Chest Radiograph (CXR)",
        task="Multi-Label Thoracic Disease Classification (14 Observations)",
        num_samples="224,316 radiographs",
        classes=["Pneumonia", "Cardiomegaly", "Pleural Effusion", "Atelectasis", "Edema", "Consolidation", "Pneumothorax"],
        annotations_type="Radiologist Report Extraction (Rule-Based NLP)",
        access_level="Credentialed Access Required (Stanford AIMI)",
        role_in_research="Core Primary (Prediction & Uncertainty Evaluation)",
        status="Configured (Demo Mode Active)",
        citation="Irvin et al., AAAI 2019",
        description="Standard large-scale benchmark for chest radiograph classification with explicit uncertainty labels."
    ),
    DatasetMetadata(
        id="chexlocalize",
        name="CheXlocalize",
        modality="Chest Radiograph (CXR)",
        task="Pixel-Level Radiologist Benchmark for Thoracic Pathology",
        num_samples="2,340 expert segmentations across 643 images",
        classes=["Pneumonia", "Cardiomegaly", "Pleural Effusion", "Atelectasis", "Edema", "Consolidation"],
        annotations_type="Multi-Radiologist Pixel Contours & Saliency Masks",
        access_level="Credentialed Access Required (Stanford AIMI)",
        role_in_research="Core Primary (Ground-Truth Localization Evaluation)",
        status="Configured (Demo Mode Active)",
        citation="Saporta et al., Nature Communications 2022",
        description="Gold standard for evaluating the localization accuracy of XAI methods against certified radiologist segmentations."
    ),
    DatasetMetadata(
        id="isic",
        name="ISIC 2024 / HAM10000",
        modality="Dermoscopy",
        task="Skin Lesion Multi-Class Diagnosis",
        num_samples="40,000+ dermoscopic images",
        classes=["Malignant Melanoma", "Melanocytic Nevus", "Basal Cell Carcinoma", "Benign Keratosis", "Dermatofibroma"],
        annotations_type="Histopathology Confirmed + Expert Bounding Masks",
        access_level="Open Research (ISIC Archive)",
        role_in_research="Cross-Domain Validation (Dermatology)",
        status="Configured (Demo Mode Active)",
        citation="Tschandl et al., Scientific Data 2018 / ISIC Challenge",
        description="High-resolution dermoscopy dataset for assessing whether explanation reliability principles generalize from radiology to oncology."
    ),
    DatasetMetadata(
        id="brats",
        name="BraTS 2023",
        modality="Brain MRI (Multi-parametric: FLAIR, T1w, T1gd, T2w)",
        task="Brain Tumor Segmentation & Sub-region Characterization",
        num_samples="1,251 multi-modal 3D MRI scans",
        classes=["Glioblastoma (HGG)", "Low Grade Glioma (LGG)", "Peritumoral Edema", "Enhancing Tumor Core"],
        annotations_type="Multi-Expert Neuroradiologist Voxel Masks",
        access_level="Open Research (Synapse Challenge)",
        role_in_research="Cross-Domain Validation (Neuro-imaging)",
        status="Configured (Demo Mode Active)",
        citation="Bakas et al., Nature Scientific Data 2017 / MICCAI",
        description="Comprehensive benchmark for multi-sequence neurological pathology localization and 3D volumetric explanation stability."
    ),
    DatasetMetadata(
        id="vindr-cxr",
        name="VinDr-CXR",
        modality="Chest Radiograph (CXR)",
        task="Chest Anomaly Detection with Bounding Box Annotations",
        num_samples="18,000 CXR scans",
        classes=["Pneumonia", "Cardiomegaly", "Pleural Effusion", "Lung Opacity", "Aortic Enlargement"],
        annotations_type="17 Radiologists Consensus Bounding Boxes",
        access_level="Open Research (PhysioNet Credentialed)",
        role_in_research="External CXR Validation",
        status="Available for Remote Validation",
        citation="Nguyen et al., Scientific Data 2022",
        description="External cohort from Vietnamese hospitals to test out-of-distribution explanation reliability."
    ),
    DatasetMetadata(
        id="mimic-cxr",
        name="MIMIC-CXR-JPG",
        modality="Chest Radiograph (CXR)",
        task="Thoracic Pathology & Report Generation",
        num_samples="377,110 radiographs",
        classes=["Cardiomegaly", "Pneumonia", "Pneumothorax", "Pleural Effusion", "Atelectasis"],
        annotations_type="EHR & Free-text Radiology Reports",
        access_level="Credentialed Access Required (PhysioNet CITI Training)",
        role_in_research="External Generalization & Robustness",
        status="Awaiting Credentials",
        citation="Johnson et al., Scientific Data 2019",
        description="Large-scale real-world ICU clinical radiology dataset for stress-testing model and explainer calibration under domain shift."
    )
]
