import React, { useState, useEffect } from 'react';
import {
  Settings,
  FolderOpen,
  Play,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Database,
  TrendingUp,
  Activity,
  Layers,
  Loader2,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../lib/api';
import { DatasetScanResult, TrainingStatusResponse } from '../../types';

export const SettingsView: React.FC = () => {
  // Dataset Scanner State
  const [datasetPath, setDatasetPath] = useState<string>('./data/chexpert');
  const [datasetName, setDatasetName] = useState<string>('CheXpert Mini Benchmark');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DatasetScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Model Training State
  const [trainArch, setTrainArch] = useState<string>('densenet121');
  const [epochs, setEpochs] = useState<number>(10);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [learningRate, setLearningRate] = useState<number>(0.0001);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [trainStatus, setTrainStatus] = useState<TrainingStatusResponse | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);

  // Poll training status if active
  useEffect(() => {
    let interval: any;
    if (activeJobId && isTraining) {
      interval = setInterval(async () => {
        try {
          const status = await api.getTrainingStatus(activeJobId);
          setTrainStatus(status);
          if (status.status === 'completed' || status.status === 'failed') {
            setIsTraining(false);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeJobId, isTraining]);

  const handleScanDataset = async () => {
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await api.scanDataset({
        root_path: datasetPath,
        dataset_name: datasetName,
        train_pct: 0.70,
        val_pct: 0.15,
        test_pct: 0.15,
        enforce_patient_split: true
      });
      setScanResult(res);
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan dataset directory');
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainError(null);
    try {
      const res = await api.startTraining({
        dataset_path: datasetPath,
        dataset_name: datasetName,
        architecture: trainArch,
        epochs: epochs,
        batch_size: batchSize,
        learning_rate: learningRate,
        weight_decay: 0.01,
        seed: 42,
        use_patient_split: true,
        output_dir: './checkpoints'
      });
      setActiveJobId(res.job_id);
    } catch (err: any) {
      setTrainError(err.message || 'Failed to start training');
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Research Lab &amp; Training Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Dataset ingestion, patient-aware splitting, real PyTorch transfer learning, and environment telemetry
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          PyTorch Real Engine
        </span>
      </div>

      {/* Grid: Left Dataset Ingestion & Splitter, Right Training Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Dataset Ingestion (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <Database className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1. Dataset Ingestion &amp; Patient Splitter
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dataset Directory Path</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={datasetPath}
                  onChange={(e) => setDatasetPath(e.target.value)}
                  placeholder="./data/chexpert"
                  className="flex-1 px-3 py-1.5 rounded border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleScanDataset}
                  disabled={isScanning}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-2xs flex items-center space-x-1 disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderOpen className="w-3.5 h-3.5" />}
                  <span>{isScanning ? 'Scanning...' : 'Scan & Validate'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dataset Label / Identifier</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white"
              />
            </div>

            {scanError && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {scanResult && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Scan Summary:</span>
                  <span className="font-mono text-blue-600 font-semibold">{scanResult.total_images} valid images</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">TRAIN (70%)</span>
                    <span className="font-bold text-slate-900">{scanResult.train_count}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">VAL (15%)</span>
                    <span className="font-bold text-slate-900">{scanResult.val_count}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">TEST (15%)</span>
                    <span className="font-bold text-slate-900">{scanResult.test_count}</span>
                  </div>
                </div>

                {/* Patient Split Tag */}
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Patient-Level Split Active: <strong>{scanResult.unique_patients_detected} unique patients</strong> (0 data leakage).</span>
                </div>

                {/* Class Distribution */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Classes Discovered:</span>
                  <div className="space-y-1">
                    {Object.entries(scanResult.class_distribution).map(([cName, count]) => (
                      <div key={cName} className="flex justify-between text-[11px] text-slate-600">
                        <span>{cName}</span>
                        <span className="font-mono font-semibold text-slate-800">{count} images</span>
                      </div>
                    ))}
                  </div>
                </div>

                {scanResult.class_imbalance_warning && (
                  <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    {scanResult.class_imbalance_warning}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Model Training Dashboard (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              2. PyTorch Training Engine
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Architecture</label>
                <select
                  value={trainArch}
                  onChange={(e) => setTrainArch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white"
                >
                  <option value="densenet121">DenseNet-121 (Radiology)</option>
                  <option value="resnet50">ResNet-50</option>
                  <option value="efficientnet_b4">EfficientNet-B4</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Epochs</label>
                <input
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value) || 10)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 16)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Learning Rate</label>
                <input
                  type="number"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.0001)}
                  step="0.00001"
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleStartTraining}
              disabled={isTraining}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-2xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isTraining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isTraining ? 'Training in Background...' : 'Start Training Run'}</span>
            </button>

            {trainError && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                {trainError}
              </div>
            )}

            {/* Live Training Progress Panel */}
            {trainStatus && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-slate-800">Job: {trainStatus.job_id}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      trainStatus.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : trainStatus.status === 'running'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {trainStatus.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block">EPOCH</span>
                    <span className="font-bold text-slate-900">{trainStatus.current_epoch} / {trainStatus.total_epochs}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block">TRAIN LOSS</span>
                    <span className="font-bold text-slate-900">{trainStatus.train_loss ?? '—'}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block">VAL LOSS</span>
                    <span className="font-bold text-slate-900">{trainStatus.val_loss ?? '—'}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-400 block">VAL ACC</span>
                    <span className="font-bold text-emerald-600">{trainStatus.val_acc ? `${trainStatus.val_acc}%` : '—'}</span>
                  </div>
                </div>

                <div className="text-[10px] font-sans text-slate-500 flex justify-between">
                  <span>Device: <strong>{trainStatus.device}</strong></span>
                  <span>Elapsed: <strong>{trainStatus.elapsed_seconds}s</strong></span>
                </div>

                {trainStatus.checkpoint_path && (
                  <div className="p-1.5 bg-emerald-50 rounded text-[10px] text-emerald-800 border border-emerald-200 truncate">
                    ✓ Checkpoint saved: {trainStatus.checkpoint_path}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Research Disclaimer */}
      <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center space-x-2 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Research Prototype Disclaimer</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-800">
          TrustXAI-Med is an experimental research platform designed for investigating explanation reliability and uncertainty estimation in medical imaging. It is not approved by FDA/CE and is not intended for diagnostic or clinical decision-making.
        </p>
      </div>
    </div>
  );
};
