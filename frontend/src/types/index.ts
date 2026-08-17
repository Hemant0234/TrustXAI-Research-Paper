export interface PredictionResult {
  label: string;
  probability: number;
  probabilities: Record<string, number>;
  logits?: Record<string, number>;
}

export interface UncertaintyResult {
  score: number;
  level: 'low' | 'moderate' | 'high' | 'very_high';
  entropy: number;
  calibration_error: number;
  monte_carlo_variance?: number;
  interpretation: string;
  alignment_with_confidence: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface SaliencyMapData {
  method: string;
  matrix: number[][];
  grid_size: number[];
  faithfulness: number;
  localization?: number | null;
  stability: number;
  robustness: number;
  consistency: number;
  human_agreement?: number | null;
  provenance: Record<string, any>;
}

export interface FusionResult {
  fused_matrix: number[][];
  agreement_matrix: number[][];
  disagreement_matrix: number[][];
  overall_agreement: number;
  fusion_confidence: number;
  weights_used: Record<string, number>;
  pairwise_agreement: Record<string, number>;
  fusion_strategy: string;
}

export interface XQIDimensions {
  overall: number;
  faithfulness: number;
  localization?: number | null;
  robustness: number;
  stability: number;
  consistency: number;
  human_agreement?: number | null;
  uncertainty_alignment: number;
  weights: Record<string, number>;
  status: string;
  mathematical_formulation: string;
  is_research_baseline: boolean;
}

export interface ReliabilityAssessment {
  score: number;
  level: 'RELIABLE' | 'CAUTION' | 'REVIEW REQUIRED';
  trust_verdict: string;
  evidence_positive: string[];
  evidence_concerns: string[];
  should_trust_explanation: boolean;
  clinical_recommendation: string;
}

export interface CaseAnalysis {
  case_id: string;
  modality: string;
  dataset: string;
  model_name: string;
  image_url?: string;
  image_base64?: string;
  ground_truth_class?: string;
  ground_truth_bbox?: number[];
  prediction: PredictionResult;
  uncertainty: UncertaintyResult;
  explanations: Record<string, SaliencyMapData>;
  fusion: FusionResult;
  xqi: XQIDimensions;
  reliability: ReliabilityAssessment;
  is_demo: boolean;
  provenance: Record<string, any>;
}

export interface CaseSummary {
  case_id: string;
  modality: string;
  dataset: string;
  model_name: string;
  predicted_label: string;
  confidence: number;
  uncertainty_level: string;
  uncertainty_score: number;
  xqi_score: number;
  reliability_score: number;
  reliability_level: 'RELIABLE' | 'CAUTION' | 'REVIEW REQUIRED';
  overall_agreement: number;
  is_demo: boolean;
}

export interface DatasetItem {
  id: string;
  name: string;
  modality: string;
  task: string;
  num_samples: string;
  classes: string[];
  annotations_type: string;
  access_level: string;
  role_in_research: string;
  status: string;
  citation: string;
  description: string;
}

export interface ModelItem {
  id: string;
  name: string;
  architecture: string;
  domain: string;
  default_dataset: string;
  task: string;
  auc_roc: number;
  accuracy: number;
  calibration_ece: number;
  parameters: string;
  status: string;
  layer_hook: string;
}

export interface ExperimentItem {
  id: string;
  name: string;
  model: string;
  dataset: string;
  xai_methods: string[];
  fusion_strategy: string;
  uncertainty_method: string;
  mean_xqi: number;
  mean_reliability: number;
  auc_roc: number;
  ece_calibration: number;
  perturbation_stability: number;
  localization_agreement?: number | null;
  date_run: string;
  status: string;
  notes: string;
}

export interface AblationItem {
  condition_id: string;
  name: string;
  description: string;
  accuracy: number;
  auc_roc: number;
  calibration_ece: number;
  faithfulness: number;
  localization: number;
  stability: number;
  robustness: number;
  xqi: number;
  reliability: number;
}

export interface ClinicianStudyCondition {
  condition_id: string;
  code: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string;
  features_shown: string[];
}

export interface StudyBenchmarkSummary {
  condition: string;
  condition_name: string;
  mean_diagnostic_accuracy: number;
  mean_clinician_trust: number;
  mean_decision_time: number;
  overreliance_on_incorrect_ai: number;
  clinician_satisfaction: number;
}

export interface ClinicianResponse {
  participant_id: string;
  participant_role: string;
  case_id: string;
  condition_code: string;
  diagnostic_decision: string;
  diagnostic_confidence: number;
  clinician_trust_score: number;
  decision_time_seconds: number;
  explanation_utility_rating: number;
  clinical_feedback?: string;
  timestamp?: number;
}

export interface PerturbationResult {
  case_id: string;
  perturbation_type: string;
  intensity: number;
  original_prediction: string;
  original_confidence: number;
  perturbed_prediction: string;
  perturbed_confidence: number;
  perturbed_uncertainty: number;
  original_xqi: number;
  perturbed_xqi: number;
  explanation_similarity: number;
  localization_consistency: number;
  perturbation_stability_score: number;
  perturbed_matrix: number[][];
  difference_matrix: number[][];
  interpretation: string;
}
