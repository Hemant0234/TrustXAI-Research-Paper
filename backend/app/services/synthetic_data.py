import io
import base64
from typing import Dict, Any, List
from app.schemas.cases import (
    CaseAnalysisResponse,
    PredictionResult,
    UncertaintyResult,
    SaliencyMapData,
    FusionResult,
    XQIDimensions,
    ReliabilityAssessment
)
from app.xai.gradcam import GradCAMPlusPlusExplainer
from app.xai.shap_explainer import SHAPExplainer
from app.xai.integrated_gradients import IntegratedGradientsExplainer
from app.xai.attention_rollout import AttentionRolloutExplainer
from app.fusion.fusion_engine import ExplanationFusionEngine
from app.quality.xqi import XQICalculator
from app.reliability.reliability_engine import ExplanationReliabilityEngine

def generate_medical_case_image(modality: str, case_id: str) -> str:
    """
    Renders synthetic medical scan visuals and returns base64 data URL.
    Supports PIL Image when available and falls back to clean biomedical SVG data URI.
    """
    try:
        from PIL import Image, ImageDraw, ImageFilter
        width, height = 384, 384
        img = Image.new("RGB", (width, height), color=(18, 22, 28))
        draw = ImageDraw.Draw(img)

        if modality == "Chest X-Ray":
            draw.ellipse([50, 40, 180, 320], fill=(42, 48, 56), outline=(70, 78, 90), width=2)
            draw.ellipse([204, 40, 334, 320], fill=(42, 48, 56), outline=(70, 78, 90), width=2)
            if "2047" in case_id:
                draw.polygon([(140, 100), (280, 240), (250, 310), (130, 290)], fill=(75, 82, 94), outline=(100, 110, 125))
            else:
                draw.polygon([(160, 100), (235, 230), (210, 290), (150, 270)], fill=(65, 72, 82), outline=(90, 98, 110))
            draw.line([192, 20, 192, 360], fill=(95, 105, 118), width=8)
            draw.line([60, 60, 190, 85], fill=(85, 95, 108), width=4)
            draw.line([324, 60, 194, 85], fill=(85, 95, 108), width=4)
            for r in range(100, 320, 30):
                draw.arc([40, r-15, 185, r+35], start=180, end=350, fill=(70, 78, 88), width=2)
                draw.arc([199, r-15, 344, r+35], start=190, end=360, fill=(70, 78, 88), width=2)
            if "2048" in case_id:
                draw.ellipse([220, 190, 310, 280], fill=(90, 100, 115))
            elif "2049" in case_id:
                draw.polygon([(230, 270), (330, 280), (330, 330), (220, 330)], fill=(95, 105, 120))
        elif modality == "Dermoscopy":
            draw.rectangle([0, 0, width, height], fill=(195, 160, 135))
            draw.ellipse([80, 90, 300, 290], fill=(45, 28, 22), outline=(30, 15, 10), width=4)
            draw.ellipse([120, 110, 250, 240], fill=(22, 12, 8))
            draw.ellipse([200, 160, 280, 260], fill=(70, 35, 25))
        elif modality == "Brain MRI":
            draw.ellipse([45, 30, 339, 354], fill=(48, 54, 62), outline=(90, 98, 110), width=3)
            draw.ellipse([70, 55, 314, 329], fill=(62, 68, 78))
            draw.ellipse([160, 140, 185, 220], fill=(25, 28, 34))
            draw.ellipse([199, 140, 224, 220], fill=(25, 28, 34))
            draw.ellipse([210, 90, 300, 180], fill=(120, 128, 142), outline=(150, 160, 175), width=2)
            draw.ellipse([230, 110, 280, 160], fill=(165, 175, 190))

        img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
        draw_final = ImageDraw.Draw(img)
        draw_final.text((12, 12), f"TX-MED | {case_id} | {modality.upper()}", fill=(180, 190, 200))
        draw_final.text((12, 360), "DEMO SYNTHETIC DATASET (DE-IDENTIFIED)", fill=(120, 130, 140))

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_str}"
    except ImportError:
        # High quality biomedical SVG fallback
        is_cardio = "2047" in case_id
        is_pneu = "2048" in case_id
        is_dermo = modality == "Dermoscopy"
        is_mri = modality == "Brain MRI"

        if is_dermo:
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 384 384">
            <rect width="384" height="384" fill="#c3a087"/>
            <circle cx="190" cy="190" r="110" fill="#2d1c16" stroke="#1e0f0a" stroke-width="4"/>
            <circle cx="180" cy="175" r="70" fill="#160c08"/>
            <circle cx="230" cy="210" r="45" fill="#462319"/>
            <text x="14" y="24" fill="#503525" font-family="monospace" font-size="11">TX-MED | {case_id} | DERMOSCOPY</text>
            <text x="14" y="370" fill="#664530" font-family="monospace" font-size="9">DEMO SYNTHETIC (DE-IDENTIFIED)</text>
            </svg>'''
        elif is_mri:
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 384 384">
            <rect width="384" height="384" fill="#12161c"/>
            <ellipse cx="192" cy="192" rx="145" ry="160" fill="#30363e" stroke="#5a626e" stroke-width="3"/>
            <ellipse cx="192" cy="192" rx="120" ry="135" fill="#3e444e"/>
            <ellipse cx="172" cy="180" rx="12" ry="40" fill="#191c22"/>
            <ellipse cx="212" cy="180" rx="12" ry="40" fill="#191c22"/>
            <circle cx="250" cy="140" r="45" fill="#78808e" stroke="#96a0af" stroke-width="2"/>
            <circle cx="255" cy="135" r="25" fill="#a5afbe"/>
            <text x="14" y="24" fill="#b4bec8" font-family="monospace" font-size="11">TX-MED | {case_id} | BRAIN MRI</text>
            <text x="14" y="370" fill="#78828c" font-family="monospace" font-size="9">DEMO SYNTHETIC (DE-IDENTIFIED)</text>
            </svg>'''
        else:
            # Chest X-Ray SVG
            heart_path = "M 140 100 L 280 240 L 250 310 L 130 290 Z" if is_cardio else "M 160 100 L 235 230 L 210 290 L 150 270 Z"
            consolidation = '<ellipse cx="265" cy="235" rx="45" ry="40" fill="#5a6473"/>' if is_pneu else ''
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 384 384">
            <rect width="384" height="384" fill="#12161c"/>
            <ellipse cx="115" cy="180" rx="65" ry="135" fill="#2a3038" stroke="#464e5a" stroke-width="2"/>
            <ellipse cx="269" cy="180" rx="65" ry="135" fill="#2a3038" stroke="#464e5a" stroke-width="2"/>
            <path d="{heart_path}" fill="#4b525e" stroke="#646e7d"/>
            <line x1="192" y1="20" x2="192" y2="360" stroke="#5f6976" stroke-width="8"/>
            <line x1="60" y1="60" x2="190" y2="85" stroke="#555f6c" stroke-width="4"/>
            <line x1="324" y1="60" x2="194" y2="85" stroke="#555f6c" stroke-width="4"/>
            {consolidation}
            <text x="14" y="24" fill="#b4bec8" font-family="monospace" font-size="11">TX-MED | {case_id} | CHEST X-RAY</text>
            <text x="14" y="370" fill="#78828c" font-family="monospace" font-size="9">DEMO SYNTHETIC (DE-IDENTIFIED)</text>
            </svg>'''
        b64 = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
        return f"data:image/svg+xml;base64,{b64}"

class SyntheticCaseLibrary:
    """
    Provides deterministic, clinically structured research test cases
    including the flagship 'killer demo' case (TX-2047).
    """

    @classmethod
    def get_case_tx2048(cls) -> CaseAnalysisResponse:
        gradcam = GradCAMPlusPlusExplainer.create_mock_saliency(0.60, 0.68, 0.18, 0.05, 32, 88.0, 93.0, 86.0, 82.0, 90.0)
        shap = SHAPExplainer.create_mock_saliency(0.59, 0.67, 0.17, 0.07, 32, 85.0, 90.0, 83.0, 79.0, 88.0)
        ig = IntegratedGradientsExplainer.create_mock_saliency(0.60, 0.69, 0.16, 0.06, 32, 91.0, 94.0, 89.0, 85.0, 92.0)
        att = AttentionRolloutExplainer.create_mock_saliency(0.58, 0.66, 0.19, 0.08, 32, 82.0, 88.0, 80.0, 76.0, 84.0)

        explanations = {
            "Grad-CAM++": gradcam,
            "SHAP": shap,
            "Integrated Gradients": ig,
            "Attention Rollout": att
        }

        fusion = ExplanationFusionEngine().fuse_explanations(explanations, uncertainty_score=0.12)
        xqi = XQICalculator.calculate_xqi(88.0, 93.0, 81.0, 85.0, 90.0, None, 86.0)

        uncertainty = UncertaintyResult(
            score=0.12,
            level="low",
            entropy=0.21,
            calibration_error=0.045,
            monte_carlo_variance=0.012,
            interpretation="Low predictive uncertainty. The predictive distribution is sharply peaked on Pneumonia.",
            alignment_with_confidence="HIGH"
        )

        reliability = ExplanationReliabilityEngine.evaluate_reliability(
            confidence_prob=0.914,
            uncertainty=uncertainty,
            xqi=xqi,
            fusion=fusion,
            localization_score=93.0
        )

        return CaseAnalysisResponse(
            case_id="TX-2048",
            modality="Chest X-Ray",
            dataset="CheXpert / CheXlocalize",
            model_name="DenseNet-121 (Radiology Backbone)",
            image_base64=generate_medical_case_image("Chest X-Ray", "TX-2048"),
            ground_truth_class="Pneumonia",
            ground_truth_bbox=[0.55, 0.58, 0.78, 0.82],
            prediction=PredictionResult(
                label="Pneumonia",
                probability=0.914,
                probabilities={
                    "Pneumonia": 0.914,
                    "Atelectasis": 0.052,
                    "Pleural Effusion": 0.021,
                    "No Finding": 0.013
                }
            ),
            uncertainty=uncertainty,
            explanations=explanations,
            fusion=fusion,
            xqi=xqi,
            reliability=reliability,
            is_demo=True,
            provenance={
                "source": "demo",
                "simulated": True,
                "dataset_source": "Stanford CheXpert Core Subsample",
                "weights_version": "v1.2-baseline"
            }
        )

    @classmethod
    def get_case_tx2047(cls) -> CaseAnalysisResponse:
        """
        TX-2047 (THE KILLER DEMO): High Confidence (93.2%), High Uncertainty Anomaly,
        Low XQI (49), Low Reliability (46), Severe XAI Disagreement.
        Status: REVIEW REQUIRED.
        """
        gradcam = GradCAMPlusPlusExplainer.create_mock_saliency(0.72, 0.35, 0.28, 0.18, 32, 54.0, 42.0, 48.0, 45.0, 52.0)
        shap = SHAPExplainer.create_mock_saliency(0.25, 0.70, 0.22, 0.22, 32, 48.0, 38.0, 41.0, 39.0, 46.0)
        ig = IntegratedGradientsExplainer.create_mock_saliency(0.48, 0.52, 0.15, 0.20, 32, 56.0, 51.0, 44.0, 42.0, 50.0)
        att = AttentionRolloutExplainer.create_mock_saliency(0.85, 0.60, 0.30, 0.25, 32, 42.0, 35.0, 38.0, 36.0, 40.0)

        explanations = {
            "Grad-CAM++": gradcam,
            "SHAP": shap,
            "Integrated Gradients": ig,
            "Attention Rollout": att
        }

        fusion = ExplanationFusionEngine().fuse_explanations(explanations, uncertainty_score=0.48)
        xqi = XQICalculator.calculate_xqi(51.0, 42.0, 41.0, 44.0, 48.0, None, 35.0)

        uncertainty = UncertaintyResult(
            score=0.58,
            level="high",
            entropy=0.62,
            calibration_error=0.182,
            monte_carlo_variance=0.088,
            interpretation="Elevated predictive uncertainty and high Monte Carlo variance despite peaked top probability.",
            alignment_with_confidence="LOW"
        )

        reliability = ExplanationReliabilityEngine.evaluate_reliability(
            confidence_prob=0.932,
            uncertainty=uncertainty,
            xqi=xqi,
            fusion=fusion,
            localization_score=42.0
        )

        return CaseAnalysisResponse(
            case_id="TX-2047",
            modality="Chest X-Ray",
            dataset="CheXpert / CheXlocalize",
            model_name="DenseNet-121 (Radiology Backbone)",
            image_base64=generate_medical_case_image("Chest X-Ray", "TX-2047"),
            ground_truth_class="Cardiomegaly",
            ground_truth_bbox=[0.35, 0.40, 0.80, 0.75],
            prediction=PredictionResult(
                label="Cardiomegaly",
                probability=0.932,
                probabilities={
                    "Cardiomegaly": 0.932,
                    "Pleural Effusion": 0.038,
                    "Enlarged Cardiomediastinum": 0.020,
                    "No Finding": 0.010
                }
            ),
            uncertainty=uncertainty,
            explanations=explanations,
            fusion=fusion,
            xqi=xqi,
            reliability=reliability,
            is_demo=True,
            provenance={
                "source": "demo",
                "simulated": True,
                "dataset_source": "Stanford CheXpert Disagreement Benchmark",
                "weights_version": "v1.2-baseline"
            }
        )

    @classmethod
    def get_case_tx2049(cls) -> CaseAnalysisResponse:
        gradcam = GradCAMPlusPlusExplainer.create_mock_saliency(0.78, 0.72, 0.16, 0.04, 32, 92.0, 95.0, 89.0, 86.0, 93.0)
        shap = SHAPExplainer.create_mock_saliency(0.77, 0.71, 0.15, 0.06, 32, 89.0, 92.0, 86.0, 84.0, 90.0)
        ig = IntegratedGradientsExplainer.create_mock_saliency(0.79, 0.73, 0.14, 0.05, 32, 94.0, 96.0, 91.0, 88.0, 95.0)
        att = AttentionRolloutExplainer.create_mock_saliency(0.76, 0.70, 0.18, 0.07, 32, 85.0, 90.0, 82.0, 79.0, 86.0)

        explanations = {
            "Grad-CAM++": gradcam,
            "SHAP": shap,
            "Integrated Gradients": ig,
            "Attention Rollout": att
        }

        fusion = ExplanationFusionEngine().fuse_explanations(explanations, uncertainty_score=0.28)
        xqi = XQICalculator.calculate_xqi(91.0, 94.0, 86.0, 89.0, 92.0, None, 88.0)

        uncertainty = UncertaintyResult(
            score=0.32,
            level="moderate",
            entropy=0.42,
            calibration_error=0.062,
            monte_carlo_variance=0.024,
            interpretation="Moderate predictive dispersion between Pleural Effusion and Atelectasis.",
            alignment_with_confidence="HIGH"
        )

        reliability = ExplanationReliabilityEngine.evaluate_reliability(
            confidence_prob=0.780,
            uncertainty=uncertainty,
            xqi=xqi,
            fusion=fusion,
            localization_score=94.0
        )

        return CaseAnalysisResponse(
            case_id="TX-2049",
            modality="Chest X-Ray",
            dataset="CheXpert / CheXlocalize",
            model_name="DenseNet-121 (Radiology Backbone)",
            image_base64=generate_medical_case_image("Chest X-Ray", "TX-2049"),
            ground_truth_class="Pleural Effusion",
            ground_truth_bbox=[0.68, 0.65, 0.90, 0.88],
            prediction=PredictionResult(
                label="Pleural Effusion",
                probability=0.780,
                probabilities={
                    "Pleural Effusion": 0.780,
                    "Atelectasis": 0.142,
                    "Infiltration": 0.051,
                    "No Finding": 0.027
                }
            ),
            uncertainty=uncertainty,
            explanations=explanations,
            fusion=fusion,
            xqi=xqi,
            reliability=reliability,
            is_demo=True,
            provenance={
                "source": "demo",
                "simulated": True,
                "dataset_source": "Stanford CheXpert Costophrenic Angle Set",
                "weights_version": "v1.2-baseline"
            }
        )

    @classmethod
    def get_case_tx3012(cls) -> CaseAnalysisResponse:
        gradcam = GradCAMPlusPlusExplainer.create_mock_saliency(0.50, 0.50, 0.25, 0.06, 32, 86.0, 91.0, 84.0, 80.0, 89.0)
        shap = SHAPExplainer.create_mock_saliency(0.49, 0.51, 0.24, 0.08, 32, 83.0, 88.0, 81.0, 77.0, 85.0)
        ig = IntegratedGradientsExplainer.create_mock_saliency(0.50, 0.50, 0.22, 0.07, 32, 89.0, 93.0, 87.0, 83.0, 91.0)
        att = AttentionRolloutExplainer.create_mock_saliency(0.51, 0.48, 0.26, 0.09, 32, 80.0, 85.0, 78.0, 74.0, 82.0)

        explanations = {
            "Grad-CAM++": gradcam,
            "SHAP": shap,
            "Integrated Gradients": ig,
            "Attention Rollout": att
        }

        fusion = ExplanationFusionEngine().fuse_explanations(explanations, uncertainty_score=0.18)
        xqi = XQICalculator.calculate_xqi(85.0, 90.0, 80.0, 83.0, 88.0, None, 84.0)
        uncertainty = UncertaintyResult(
            score=0.18, level="low", entropy=0.28, calibration_error=0.051,
            monte_carlo_variance=0.015,
            interpretation="Low uncertainty; pigment lesion exhibits classical asymmetric peripheral network.",
            alignment_with_confidence="HIGH"
        )
        reliability = ExplanationReliabilityEngine.evaluate_reliability(0.892, uncertainty, xqi, fusion, 90.0)

        return CaseAnalysisResponse(
            case_id="TX-3012",
            modality="Dermoscopy",
            dataset="ISIC 2024 / HAM10000",
            model_name="EfficientNet-B4 (Dermoscopy)",
            image_base64=generate_medical_case_image("Dermoscopy", "TX-3012"),
            ground_truth_class="Malignant Melanoma",
            prediction=PredictionResult(
                label="Malignant Melanoma",
                probability=0.892,
                probabilities={
                    "Malignant Melanoma": 0.892,
                    "Melanocytic Nevus": 0.078,
                    "Basal Cell Carcinoma": 0.021,
                    "Benign Keratosis": 0.009
                }
            ),
            uncertainty=uncertainty,
            explanations=explanations,
            fusion=fusion,
            xqi=xqi,
            reliability=reliability,
            is_demo=True,
            provenance={"source": "demo", "simulated": True, "dataset": "ISIC 2024 Archive"}
        )

    @classmethod
    def get_case_tx4085(cls) -> CaseAnalysisResponse:
        gradcam = GradCAMPlusPlusExplainer.create_mock_saliency(0.35, 0.65, 0.18, 0.06, 32, 84.0, 89.0, 82.0, 79.0, 87.0)
        shap = SHAPExplainer.create_mock_saliency(0.34, 0.66, 0.17, 0.08, 32, 81.0, 86.0, 79.0, 76.0, 83.0)
        ig = IntegratedGradientsExplainer.create_mock_saliency(0.36, 0.65, 0.16, 0.07, 32, 88.0, 91.0, 85.0, 82.0, 89.0)
        att = AttentionRolloutExplainer.create_mock_saliency(0.33, 0.64, 0.20, 0.09, 32, 78.0, 83.0, 76.0, 73.0, 80.0)

        explanations = {
            "Grad-CAM++": gradcam,
            "SHAP": shap,
            "Integrated Gradients": ig,
            "Attention Rollout": att
        }

        fusion = ExplanationFusionEngine().fuse_explanations(explanations, uncertainty_score=0.19)
        xqi = XQICalculator.calculate_xqi(83.0, 88.0, 78.0, 81.0, 86.0, None, 82.0)
        uncertainty = UncertaintyResult(
            score=0.19, level="low", entropy=0.29, calibration_error=0.055,
            monte_carlo_variance=0.016,
            interpretation="Low uncertainty; hyperintense peritumoral edema identified in FLAIR sequence.",
            alignment_with_confidence="HIGH"
        )
        reliability = ExplanationReliabilityEngine.evaluate_reliability(0.941, uncertainty, xqi, fusion, 88.0)

        return CaseAnalysisResponse(
            case_id="TX-4085",
            modality="Brain MRI",
            dataset="BraTS 2023 / MICCAI",
            model_name="Swin Transformer (Neuro-Oncology)",
            image_base64=generate_medical_case_image("Brain MRI", "TX-4085"),
            ground_truth_class="Glioblastoma (HGG)",
            prediction=PredictionResult(
                label="Glioblastoma (HGG)",
                probability=0.941,
                probabilities={
                    "Glioblastoma (HGG)": 0.941,
                    "Low Grade Glioma (LGG)": 0.042,
                    "Meningioma": 0.012,
                    "Pituitary Tumor": 0.005
                }
            ),
            uncertainty=uncertainty,
            explanations=explanations,
            fusion=fusion,
            xqi=xqi,
            reliability=reliability,
            is_demo=True,
            provenance={"source": "demo", "simulated": True, "dataset": "BraTS Multi-Modal MRI Benchmark"}
        )

    @classmethod
    def get_all_cases(cls) -> Dict[str, CaseAnalysisResponse]:
        return {
            "TX-2048": cls.get_case_tx2048(),
            "TX-2047": cls.get_case_tx2047(),
            "TX-2049": cls.get_case_tx2049(),
            "TX-3012": cls.get_case_tx3012(),
            "TX-4085": cls.get_case_tx4085()
        }
