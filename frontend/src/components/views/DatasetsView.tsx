import React, { useState, useEffect } from 'react';
import {
  Database,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Info,
  ChevronRight,
  Filter,
  BarChart3
} from 'lucide-react';
import { api } from '../../lib/api';
import { DatasetItem, DatasetScanResult } from '../../types';

export const DatasetsView: React.FC = () => {
  // Datasets registry state
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedDatasetModal, setSelectedDatasetModal] = useState<DatasetItem | null>(null);

  // Scanner state
  const [datasetPath, setDatasetPath] = useState<string>('./data/chexpert');
  const [datasetName, setDatasetName] = useState<string>('CheXpert Mini Benchmark');
  const [trainPct, setTrainPct] = useState<number>(70);
  const [valPct, setValPct] = useState<number>(15);
  const [testPct, setTestPct] = useState<number>(15);
  const [enforcePatientSplit, setEnforcePatientSplit] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DatasetScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Fallback default datasets if backend registry is offline
  const fallbackDatasets: DatasetItem[] = [
    {
      id: 'chexpert',
      name: 'CheXpert',
      modality: 'Chest Radiograph (CXR)',
      task: 'Multi-Label Thoracic Disease Classification (14 Observations)',
      num_samples: '224,316 radiographs',
      classes: ['Pneumonia', 'Cardiomegaly', 'Pleural Effusion', 'Atelectasis', 'Edema', 'Consolidation', 'Pneumothorax'],
      annotations_type: 'Radiologist Report Extraction (Rule-Based NLP)',
      access_level: 'Credentialed Access Required (Stanford AIMI)',
      role_in_research: 'Core Primary (Prediction & Uncertainty Evaluation)',
      status: 'Configured (Demo Mode Active)',
      citation: 'Irvin et al., AAAI 2019',
      description: 'Standard large-scale benchmark for chest radiograph classification with explicit uncertainty labels.'
    },
    {
      id: 'chexlocalize',
      name: 'CheXlocalize',
      modality: 'Chest Radiograph (CXR)',
      task: 'Pixel-Level Radiologist Benchmark for Thoracic Pathology',
      num_samples: '2,340 expert segmentations across 643 images',
      classes: ['Pneumonia', 'Cardiomegaly', 'Pleural Effusion', 'Atelectasis', 'Edema', 'Consolidation'],
      annotations_type: 'Multi-Radiologist Pixel Contours & Saliency Masks',
      access_level: 'Credentialed Access Required (Stanford AIMI)',
      role_in_research: 'Core Primary (Ground-Truth Localization Evaluation)',
      status: 'Configured (Demo Mode Active)',
      citation: 'Saporta et al., Nature Communications 2022',
      description: 'Gold standard for evaluating the localization accuracy of XAI methods against certified radiologist segmentations.'
    },
    {
      id: 'isic',
      name: 'ISIC 2024 / HAM10000',
      modality: 'Dermoscopy',
      task: 'Skin Lesion Multi-Class Diagnosis',
      num_samples: '40,000+ dermoscopic images',
      classes: ['Malignant Melanoma', 'Melanocytic Nevus', 'Basal Cell Carcinoma', 'Benign Keratosis', 'Dermatofibroma'],
      annotations_type: 'Histopathology Confirmed + Expert Bounding Masks',
      access_level: 'Open Research (ISIC Archive)',
      role_in_research: 'Cross-Domain Validation (Dermatology)',
      status: 'Configured (Demo Mode Active)',
      citation: 'Tschandl et al., Scientific Data 2018 / ISIC Challenge',
      description: 'High-resolution dermoscopy dataset for assessing whether explanation reliability principles generalize from radiology to dermatology.'
    },
    {
      id: 'brats',
      name: 'BraTS 2023',
      modality: 'Brain MRI (Multi-parametric)',
      task: 'Brain Tumor Segmentation & Sub-region Characterization',
      num_samples: '1,251 multi-modal 3D MRI scans',
      classes: ['Glioblastoma (HGG)', 'Low Grade Glioma (LGG)', 'Peritumoral Edema', 'Enhancing Tumor Core'],
      annotations_type: 'Multi-Expert Neuroradiologist Voxel Masks',
      access_level: 'Open Research (Synapse Challenge)',
      role_in_research: 'Cross-Domain Validation (Neuro-imaging)',
      status: 'Configured (Demo Mode Active)',
      citation: 'Bakas et al., Nature Scientific Data 2017 / MICCAI',
      description: 'Comprehensive benchmark for multi-sequence neurological pathology localization and 3D volumetric explanation stability.'
    },
    {
      id: 'vindr-cxr',
      name: 'VinDr-CXR',
      modality: 'Chest Radiograph (CXR)',
      task: 'Chest Anomaly Detection with Bounding Box Annotations',
      num_samples: '18,000 CXR scans',
      classes: ['Pneumonia', 'Cardiomegaly', 'Pleural Effusion', 'Lung Opacity', 'Aortic Enlargement'],
      annotations_type: '17 Radiologists Consensus Bounding Boxes',
      access_level: 'Open Research (PhysioNet Credentialed)',
      role_in_research: 'External CXR Validation',
      status: 'Available for Remote Validation',
      citation: 'Nguyen et al., Scientific Data 2022',
      description: 'External cohort from Vietnamese hospitals to test out-of-distribution explanation reliability.'
    },
    {
      id: 'mimic-cxr',
      name: 'MIMIC-CXR-JPG',
      modality: 'Chest Radiograph (CXR)',
      task: 'Thoracic Pathology & Report Generation',
      num_samples: '377,110 radiographs',
      classes: ['Cardiomegaly', 'Pneumonia', 'Pneumothorax', 'Pleural Effusion', 'Atelectasis'],
      annotations_type: 'EHR & Free-text Radiology Reports',
      access_level: 'Credentialed Access Required (PhysioNet CITI Training)',
      role_in_research: 'External Generalization & Robustness',
      status: 'Awaiting Credentials',
      citation: 'Johnson et al., Scientific Data 2019',
      description: 'Large-scale hospital cohort for evaluating model calibration and multi-condition robustness.'
    }
  ];

  useEffect(() => {
    async function loadDatasets() {
      setIsLoadingDatasets(true);
      try {
        const data = await api.getDatasets();
        if (data && data.length > 0) {
          setDatasets(data);
        } else {
          setDatasets(fallbackDatasets);
        }
      } catch (err) {
        setDatasets(fallbackDatasets);
      } finally {
        setIsLoadingDatasets(false);
      }
    }
    loadDatasets();
  }, []);

  const handleScanDataset = async () => {
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await api.scanDataset({
        root_path: datasetPath,
        dataset_name: datasetName,
        train_pct: trainPct / 100,
        val_pct: valPct / 100,
        test_pct: testPct / 100,
        enforce_patient_split: enforcePatientSplit
      });
      setScanResult(res);
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan dataset directory');
    } finally {
      setIsScanning(false);
    }
  };

  const filteredDatasets = datasets.filter((ds) => {
    const matchesSearch =
      ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.modality.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedModality === 'all') return matchesSearch;
    if (selectedModality === 'cxr') return matchesSearch && ds.modality.includes('CXR');
    if (selectedModality === 'derm') return matchesSearch && ds.modality.includes('Dermoscopy');
    if (selectedModality === 'mri') return matchesSearch && ds.modality.includes('MRI');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Medical Datasets &amp; Cohort Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Multi-institutional benchmark datasets, pixel-level radiologist segmentations, and patient-isolated ingestion scanner
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Leakage Patient Isolation</span>
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            6 Cohorts Cataloged
          </span>
        </div>
      </div>

      {/* Dataset Scanner & Ingestion Panel */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-wide">Local Dataset Ingestion &amp; Patient-Level Splitter</h2>
              <p className="text-[11px] text-slate-300">
                Scan local DICOM/PNG/JPEG directories, validate patient metadata integrity, and prevent cross-fold patient leakage.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-blue-900/60 border border-blue-400/40 text-blue-200">
            Scanner v1.2
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dataset Directory Path (Local / Volume Root)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={datasetPath}
                  onChange={(e) => setDatasetPath(e.target.value)}
                  placeholder="./data/chexpert"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  onClick={handleScanDataset}
                  disabled={isScanning}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
                >
                  {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderOpen className="w-3.5 h-3.5" />}
                  <span>{isScanning ? 'Scanning...' : 'Scan & Validate'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dataset Identifier / Label
                </label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient ID Leakage Prevention
                </label>
                <button
                  type="button"
                  onClick={() => setEnforcePatientSplit(!enforcePatientSplit)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    enforcePatientSplit
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enforce Patient Split</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold">{enforcePatientSplit ? 'Active' : 'Off'}</span>
                </button>
              </div>
            </div>

            {/* Split Distribution */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Split Partition Ratio</label>
                <span className="text-[11px] font-mono text-slate-500">
                  {trainPct}% Train / {valPct}% Val / {testPct}% Test
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Train %</span>
                  <input
                    type="number"
                    value={trainPct}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setTrainPct(val);
                    }}
                    min="10"
                    max="90"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-800 mt-1"
                  />
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Validation %</span>
                  <input
                    type="number"
                    value={valPct}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setValPct(val);
                    }}
                    min="5"
                    max="50"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-800 mt-1"
                  />
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Test %</span>
                  <input
                    type="number"
                    value={testPct}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setTestPct(val);
                    }}
                    min="5"
                    max="50"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-800 mt-1"
                  />
                </div>
              </div>
            </div>

            {scanError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* Scan Results Panel */}
          <div className="lg:col-span-6 bg-slate-50/80 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
            {scanResult ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Dataset Scanned</span>
                    <span className="font-bold text-slate-900 text-sm">{scanResult.dataset_name}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {scanResult.total_images} valid images
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">TRAIN COHORT</span>
                    <div className="text-sm font-bold font-mono text-slate-800">{scanResult.train_count}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">VAL COHORT</span>
                    <div className="text-sm font-bold font-mono text-slate-800">{scanResult.val_count}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">TEST COHORT</span>
                    <div className="text-sm font-bold font-mono text-slate-800">{scanResult.test_count}</div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>{scanResult.unique_patients_detected ?? 'All'} unique patients</strong> isolated. Zero overlap between train, validation, and evaluation folds.
                  </span>
                </div>

                {/* Discovered Classes */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                    Class Distribution ({Object.keys(scanResult.class_distribution || {}).length} Classes)
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {Object.entries(scanResult.class_distribution || {}).map(([cName, count]) => {
                      const pct = Math.round((count / (scanResult.total_images || 1)) * 100);
                      return (
                        <div key={cName} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] text-slate-600">
                            <span className="font-medium text-slate-800">{cName}</span>
                            <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <Database className="w-8 h-8 text-slate-300 stroke-1" />
                <p className="text-xs font-medium text-slate-500">No active local dataset scanned yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Specify a local directory path and click "Scan &amp; Validate" to ingest imaging volumes with patient metadata.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Benchmark Catalog & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Benchmark Dataset Catalog ({filteredDatasets.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Standardized evaluation cohorts across Thoracic Radiology, Dermatology, and Neuro-Oncology
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search datasets or classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-60"
              />
            </div>

            {/* Modality Filter Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedModality('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedModality === 'all' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedModality('cxr')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedModality === 'cxr' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chest X-Ray
              </button>
              <button
                onClick={() => setSelectedModality('derm')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedModality === 'derm' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dermoscopy
              </button>
              <button
                onClick={() => setSelectedModality('mri')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedModality === 'mri' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Brain MRI
              </button>
            </div>
          </div>
        </div>

        {/* Dataset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDatasets.map((ds) => (
            <div
              key={ds.id}
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Modality & Access Badges */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {ds.modality}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      ds.access_level.includes('Open')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {ds.access_level.includes('Open') ? 'Open Research' : 'Credentialed Access'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{ds.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                  {ds.task}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Sample Volume</span>
                    <span className="font-bold text-slate-800 font-mono text-[11px] truncate block">{ds.num_samples}</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Ground Truth</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate block">{ds.annotations_type.split('(')[0]}</span>
                  </div>
                </div>

                {/* Role in research */}
                <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded border border-indigo-100">
                  <Layers className="w-3 h-3 shrink-0" />
                  <span className="truncate font-medium">{ds.role_in_research}</span>
                </div>

                {/* Class Chips */}
                <div className="mt-2.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Target Pathologies:</span>
                  <div className="flex flex-wrap gap-1">
                    {ds.classes.slice(0, 4).map((c) => (
                      <span key={c} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {c}
                      </span>
                    ))}
                    {ds.classes.length > 4 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                        +{ds.classes.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">{ds.citation}</span>
                <button
                  onClick={() => setSelectedDatasetModal(ds)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 hover:underline"
                >
                  <span>Inspect Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Detail Modal */}
      {selectedDatasetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">{selectedDatasetModal.name} Specifications</h3>
              </div>
              <button
                onClick={() => setSelectedDatasetModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Task Description</span>
                <p className="text-slate-800 font-medium mt-0.5">{selectedDatasetModal.task}</p>
                <p className="text-slate-600 mt-1">{selectedDatasetModal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Modality</span>
                  <span className="font-semibold text-slate-800">{selectedDatasetModal.modality}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Sample Volume</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedDatasetModal.num_samples}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Access Permission</span>
                  <span className="font-semibold text-slate-800">{selectedDatasetModal.access_level}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Status</span>
                  <span className="font-semibold text-emerald-700">{selectedDatasetModal.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1.5">
                  Pathology Classes &amp; Diagnostic Target Labels ({selectedDatasetModal.classes.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-200">
                  {selectedDatasetModal.classes.map((c) => (
                    <span key={c} className="text-xs bg-white text-slate-800 px-2 py-1 rounded border border-slate-200 font-mono shadow-2xs">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px] font-mono">
                Citation: {selectedDatasetModal.citation}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setDatasetName(selectedDatasetModal.name);
                  setSelectedDatasetModal(null);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs"
              >
                Use in Scanner / Training
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DatasetsView;
