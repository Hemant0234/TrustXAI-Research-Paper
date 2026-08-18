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
  mathematical_formulation?: string;
  is_research_baseline?: boolean;
}

export interface ReliabilityAssessment {
  score: number;
  level: 'RELIABLE' | 'CAUTION' | 'REVIEW REQUIRED';
  trust_verdict?: string;
  evidence_positive?: string[];
  evidence_concerns?: string[];
  should_trust_explanation?: boolean;
  clinical_recommendation?: string;
  evidence?: string[];
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

export interface DatasetScanResult {
  dataset_name: string;
  root_path: string;
  total_images: number;
  classes: string[];
  class_distribution: Record<string, number>;
  train_count: number;
  val_count: number;
  test_count: number;
  patient_level_split_applied: boolean;
  unique_patients_detected?: number;
  corrupted_images: string[];
  class_imbalance_warning?: string;
  sample_images: { class: string; filename: string; path: string }[];
}

export interface TrainingConfigPayload {
  dataset_path: string;
  dataset_name: string;
  architecture: string;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  weight_decay: number;
  seed: number;
  use_patient_split: boolean;
  output_dir: string;
}

export interface TrainingStatusResponse {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  current_epoch: number;
  total_epochs: number;
  train_loss?: number;
  val_loss?: number;
  train_acc?: number;
  val_acc?: number;
  learning_rate: number;
  device: string;
  elapsed_seconds: number;
  history: {
    epoch: number;
    train_loss: number;
    val_loss: number;
    train_acc: number;
    val_acc: number;
    learning_rate: number;
  }[];
  error_message?: string;
  checkpoint_path?: string;
}

export interface ModelItem {
  id: string;
  name: string;
  architecture: string;
  domain?: string;
  modality?: string;
  default_dataset?: string;
  training_dataset?: string;
  task?: string;
  auc_roc?: number;
  auc?: number;
  accuracy?: number;
  calibration_ece?: number;
  ece?: number;
  parameters: string;
  status: string;
  layer_hook?: string;
  is_active?: boolean;
  weights_path?: string;
}

export interface ExperimentItem {
  id: string;
  model: string;
  xai_methods: string[];
  fusion_strategy: string;
  mean_xqi: number;
  reliability: number;
  auc: number;
  date: string;
  status: string;
}

export interface AblationItem {
  id: string;
  condition: string;
  faithfulness: number;
  localization: number;
  stability: number;
  robustness: number;
  overall_xqi: number;
  reliability: number;
}

export interface ClinicianStudyCondition {
  id: string;
  name: string;
  description: string;
  features_displayed: string[];
  hypothesized_trust_effect: string;
}

export interface StudyBenchmarkSummary {
  condition: string;
  participant_count: number;
  mean_diagnostic_accuracy: number;
  mean_decision_latency_sec: number;
  mean_subjective_trust_score: number;
  overreliance_rate: number;
}

export interface ClinicianResponse {
  case_id: string;
  participant_id: string;
  condition: string;
  diagnosis_decision: string;
  confidence_rating: number;
  trust_rating: number;
  explanation_helpful: boolean;
  time_to_decision_sec: number;
  notes?: string;
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
