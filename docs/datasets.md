# Dataset Registry & Access Setup

## Benchmark Datasets

| Dataset | Modality | Samples | Role in TrustXAI-Med | Access Tier |
| :--- | :--- | :--- | :--- | :--- |
| **CheXpert** | Chest X-Ray | 224,316 | Primary Classification & Uncertainty | Credentialed (Stanford AIMI) |
| **CheXlocalize** | Chest X-Ray | 2,340 masks | Radiologist Localization Ground Truth | Credentialed (Stanford AIMI) |
| **ISIC 2024 / HAM10000** | Dermoscopy | 40,000+ | Cross-Domain Oncology | Open Research |
| **BraTS 2023** | Brain MRI (FLAIR/T1/T2)| 1,251 3D | Cross-Modality Volumetric MRI | Open Research (Synapse) |
| **VinDr-CXR** | Chest X-Ray | 18,000 | External Cohort Validation | Credentialed (PhysioNet) |
| **MIMIC-CXR-JPG** | Chest X-Ray | 377,110 | External Generalization & ICU Shift | Credentialed (PhysioNet CITI) |

## Dataset Setup Instructions
To connect local raw data folders, set the following environment variables:
```bash
export DATASET_ROOT=/data/medical_imaging/
export CHEXPERT_ROOT=/data/medical_imaging/chexpert/
export CHEXLOCALIZE_ROOT=/data/medical_imaging/chexlocalize/
export ISIC_ROOT=/data/medical_imaging/isic2024/
export BRATS_ROOT=/data/medical_imaging/brats2023/
```
In Demo Mode, TrustXAI-Med provides bundled, synthetic de-identified test cases out-of-the-box.
