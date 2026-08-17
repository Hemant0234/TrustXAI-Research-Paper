# Medical Model Training Guide for TrustXAI-Med

This guide provides instructions for training diagnostic classification backbones (DenseNet-121, ResNet-50, EfficientNet-B4) and preparing them for the **TrustXAI-Med** uncertainty-aware XAI pipeline.

---

## 1. Prerequisites & Environment Setup

### Install PyTorch with CUDA (GPU Acceleration):
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install scikit-learn pandas pillow tqdm
```

---

## 2. Dataset Preparation

Organize your raw datasets in the standard format:

```text
data/
├── chexpert/
│   ├── train.csv
│   ├── valid.csv
│   └── train/ (PNG images)
├── isic2024/
│   ├── metadata.csv
│   └── images/ (JPEG dermoscopy images)
└── brats2023/
    └── training/ (NIfTI / PNG slice extractions)
```

### Supported Dataset Sources:
1. **CheXpert (Stanford AIMI):** Multi-label CXR dataset (Pneumonia, Cardiomegaly, Effusion, Atelectasis, Edema).
2. **ISIC 2024 / HAM10000:** Dermoscopy skin lesion classification (Melanoma, Nevus, BCC, BKL).
3. **BraTS 2023 (MICCAI):** Multi-parametric brain MRI (Glioma segmentation & grading).

---

## 3. Training Diagnostic Models

Run the provided training script in `backend/app/training/train_classifier.py`:

### Train DenseNet-121 on CheXpert (Chest X-Ray):
```bash
python backend/app/training/train_classifier.py \
  --dataset chexpert \
  --data_dir ./data/chexpert \
  --arch densenet121 \
  --epochs 15 \
  --batch_size 32 \
  --lr 1e-4 \
  --output_dir ./checkpoints
```

### Train EfficientNet-B4 on ISIC (Dermoscopy):
```bash
python backend/app/training/train_classifier.py \
  --dataset isic \
  --data_dir ./data/isic \
  --arch efficientnet_b4 \
  --epochs 20 \
  --batch_size 16 \
  --lr 5e-5 \
  --output_dir ./checkpoints
```

---

## 4. Key Training Methodologies for Trustworthy XAI

### A. Monte Carlo (MC) Dropout for Epistemic Uncertainty
During architecture construction, a `Dropout(p=0.3)` layer is placed before the linear classifier. During inference in TrustXAI-Med, dropout remains active across $T=20$ forward passes to compute predictive variance:
$$\sigma_{\text{MC}}^2 = \frac{1}{T} \sum_{t=1}^T \left( P_t(y \mid x) - \bar{P}(y \mid x) \right)^2$$

### B. Temperature Scaling for Calibration (ECE Reduction)
To prevent the diagnostic model from outputting overconfident, miscalibrated probabilities, apply post-hoc temperature scaling:
$$\hat{P}(y = k \mid x) = \frac{\exp(z_k / T)}{\sum_j \exp(z_j / T)}$$
Optimize the temperature scalar $T$ on the validation split minimizing Negative Log-Likelihood (NLL).

### C. Multi-Label Loss
For medical radiographs where patients may present with co-occurring pathologies (e.g. Cardiomegaly + Pleural Effusion), use **Binary Cross-Entropy with Logits (`nn.BCEWithLogitsLoss`)** with positive class frequency reweighting:
$$\mathcal{L}_{\text{pos}} = - \sum_{c=1}^C \left[ w_c y_c \log \sigma(z_c) + (1 - y_c) \log (1 - \sigma(z_c)) \right]$$

---

## 5. Connecting Trained Checkpoints to TrustXAI-Med

Once training is complete, set the environment variable pointing to your `.pth` checkpoint:

### Windows PowerShell:
```powershell
$env:MODEL_PATH="C:\path\to\checkpoints\densenet121_chexpert.pth"
$env:CHEXPERT_ROOT="C:\path\to\data\chexpert"
```

### Linux / macOS:
```bash
export MODEL_PATH=/path/to/checkpoints/densenet121_chexpert.pth
export CHEXPERT_ROOT=/path/to/data/chexpert
```

The TrustXAI-Med FastAPI backend will automatically load the model into memory, attach feature hooks for Grad-CAM++ and Integrated Gradients, and activate real inference mode.
