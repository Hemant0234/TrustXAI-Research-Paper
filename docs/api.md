# TrustXAI-Med REST API Specification

Base URL: `http://localhost:8000/api`

## Endpoints

### Health & Telemetry
- `GET /api/health`: System health, loaded cases, active mode, and research disclaimers.

### Case Analysis
- `GET /api/cases`: Summary catalog of all benchmark research cases.
- `GET /api/cases/{case_id}`: Full multi-XAI analysis, prediction, uncertainty, fusion matrix, XQI breakdown, and reliability assessment.

### Interactive Fusion & XQI Tuning
- `POST /api/fusion/custom`: Recalculates fused saliency map and agreement matrices given custom method weights `{ "Grad-CAM++": 0.35, "SHAP": 0.25, ... }`.
- `POST /api/quality/xqi/recalculate`: Recalculates 7-dimensional XQI score and updated reliability assessment given custom dimensional weights.

### Robustness & Perturbation Lab
- `POST /api/robustness/perturb`: Runs synthetic noise/blur/contrast/rotation perturbations and returns perturbed heatmap, spatial difference matrix, and stability score.

### Registries & Studies
- `GET /api/datasets`: Dataset catalog and credential access status.
- `GET /api/models`: Model registry with AUC, calibration ECE, and architecture parameters.
- `GET /api/experiments`: Benchmark experiment comparison table.
- `GET /api/experiments/ablation`: Component ablation study matrix.
- `GET /api/clinical-study/conditions`: 4-condition reader study protocols.
- `GET /api/clinical-study/benchmarks`: Aggregated reader study outcomes.
- `POST /api/clinical-study/responses`: Submit clinician reader response.

### Reports & Provenance
- `GET /api/reports/{case_id}/markdown`: Academic Markdown case dossier.
- `GET /api/reports/{case_id}/json`: Full JSON audit representation.
- `GET /api/reports/csv`: CSV summary export across all benchmark cases.
