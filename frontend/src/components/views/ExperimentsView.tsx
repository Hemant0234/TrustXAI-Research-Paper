import React, { useState } from 'react';
import { Plus, Filter, Calendar, Check, X, Sparkles, Loader2 } from 'lucide-react';

export const ExperimentsView: React.FC = () => {
  const initialExperiments = [
    {
      id: 'E-017',
      dataset: 'CheXpert',
      model: 'DenseNet-121',
      method: 'Hybrid (4-XAI)',
      fusion: 'Weighted-Fusion v1',
      xqi: 87,
      rel: 92,
      auc: '0.941'
    },
    {
      id: 'E-016',
      dataset: 'CheXpert',
      model: 'DenseNet-121',
      method: 'SHAP',
      fusion: '—',
      xqi: 75,
      rel: 74,
      auc: '0.941'
    },
    {
      id: 'E-015',
      dataset: 'CheXpert',
      model: 'DenseNet-121',
      method: 'Grad-CAM++',
      fusion: '—',
      xqi: 72,
      rel: 69,
      auc: '0.938'
    },
    {
      id: 'E-014',
      dataset: 'CheXpert',
      model: 'ResNet-50',
      method: 'Hybrid (3-XAI)',
      fusion: 'Avg-Fusion',
      xqi: 82,
      rel: 85,
      auc: '0.935'
    },
    {
      id: 'E-013',
      dataset: 'ISIC',
      model: 'EfficientNet-B0',
      method: 'Hybrid (4-XAI)',
      fusion: 'Weighted-Fusion v1',
      xqi: 81,
      rel: 84,
      auc: '0.925'
    }
  ];

  const [experiments, setExperiments] = useState(initialExperiments);
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  // Modal State for New Experiment
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newExpDataset, setNewExpDataset] = useState<string>('CheXpert');
  const [newExpModel, setNewExpModel] = useState<string>('DenseNet-121');
  const [newExpMethod, setNewExpMethod] = useState<string>('Hybrid (4-XAI)');
  const [newExpFusion, setNewExpFusion] = useState<string>('Uncertainty-Weighted v2');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredExperiments = experiments.filter((e) => {
    if (selectedDataset !== 'all' && e.dataset !== selectedDataset) return false;
    if (selectedModel !== 'all' && e.model !== selectedModel) return false;
    if (selectedMethod !== 'all') {
      if (selectedMethod === 'Hybrid' && !e.method.includes('Hybrid')) return false;
      if (selectedMethod === 'Single' && e.method.includes('Hybrid')) return false;
    }
    return true;
  });

  const scatterPoints = filteredExperiments.map((e) => ({
    xqi: e.xqi,
    rel: e.rel,
    type: e.method.includes('Hybrid') ? (e.rel >= 88 ? 'hybrid-high' : 'hybrid-mid') : 'single'
  }));

  const handleCreateExperiment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const nextNum = experiments.length + 14;
      const newId = `E-0${nextNum}`;
      const randomXqi = Math.floor(Math.random() * 12) + 78;
      const randomRel = Math.floor(Math.random() * 12) + 80;
      const randomAuc = (0.92 + Math.random() * 0.04).toFixed(3);

      const created = {
        id: newId,
        dataset: newExpDataset,
        model: newExpModel,
        method: newExpMethod,
        fusion: newExpFusion,
        xqi: randomXqi,
        rel: randomRel,
        auc: randomAuc
      };

      setExperiments((prev) => [created, ...prev]);
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Experiment Comparison
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Compare explanation quality and reliability across XAI configurations ({filteredExperiments.length} Shown)
          </p>
        </div>

        {/* Right filters & action button */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Datasets</option>
            <option value="CheXpert">CheXpert</option>
            <option value="ISIC">ISIC</option>
            <option value="BraTS">BraTS</option>
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All Models</option>
            <option value="DenseNet-121">DenseNet-121</option>
            <option value="ResNet-50">ResNet-50</option>
            <option value="EfficientNet-B0">EfficientNet-B0</option>
          </select>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">All XAI Methods</option>
            <option value="Hybrid">Hybrid Consensus</option>
            <option value="Single">Single Explainer</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-3 py-1 rounded-md shadow-2xs flex items-center space-x-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Experiment</span>
          </button>
        </div>
      </div>

      {/* Top Section: Experiment Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Experiment ID</th>
                <th className="py-2.5 px-3">Dataset</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">XAI Method</th>
                <th className="py-2.5 px-3">Fusion Strategy</th>
                <th className="py-2.5 px-3">XQI Index</th>
                <th className="py-2.5 px-3">Reliability</th>
                <th className="py-2.5 px-3">AUC Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {filteredExperiments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 font-mono text-xs">
                  <td className="py-2.5 px-3 font-bold text-blue-600">{e.id}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{e.dataset}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{e.model}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{e.method}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500">{e.fusion}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{e.xqi}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{e.rel}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{e.auc}</td>
                </tr>
              ))}
              {filteredExperiments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 font-sans">
                    No experiments match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: XQI vs Reliability Scatter Plot & Key Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Scatter Plot (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              XQI VS RELIABILITY SCATTER DISTRIBUTION
            </div>
            <div className="flex items-center space-x-3 text-[10px] text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Hybrid High (&ge;88)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Hybrid Mid (60-87)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Single Explainer</span>
              </span>
            </div>
          </div>

          {/* SVG Scatter Plot */}
          <div className="w-full h-44 relative pt-2">
            <svg viewBox="0 0 300 130" className="w-full h-full">
              {/* Axes & Grids */}
              <line x1="30" y1="10" x2="30" y2="110" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="30" y1="110" x2="290" y2="110" stroke="#cbd5e1" strokeWidth="1" />

              <line x1="30" y1="85" x2="290" y2="85" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="290" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="35" x2="290" y2="35" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="10" y="113" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">60</text>
              <text x="10" y="88" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">70</text>
              <text x="10" y="63" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">80</text>
              <text x="10" y="38" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">90</text>
              <text x="10" y="15" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">100</text>

              {/* X Axis Labels */}
              <text x="30" y="122" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">60</text>
              <text x="95" y="122" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">70</text>
              <text x="160" y="122" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">80</text>
              <text x="225" y="122" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">90</text>
              <text x="285" y="122" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">100</text>

              {/* Axis Titles */}
              <text x="160" y="129" fontSize="7" fill="#64748b" textAnchor="middle" fontWeight="bold">
                XQI
              </text>
              <text x="8" y="60" fontSize="7" fill="#64748b" textAnchor="middle" transform="rotate(-90 8,60)" fontWeight="bold">
                Reliability
              </text>

              {/* Scatter Circles */}
              {scatterPoints.map((pt, i) => {
                const cx = Math.max(30, Math.min(290, 30 + ((pt.xqi - 60) / 40) * 260));
                const cy = Math.max(10, Math.min(110, 110 - ((pt.rel - 60) / 40) * 100));
                const fill =
                  pt.type === 'hybrid-high'
                    ? '#2563eb'
                    : pt.type === 'hybrid-mid'
                    ? '#06b6d4'
                    : '#94a3b8';
                return <circle key={i} cx={cx} cy={cy} r="4.5" fill={fill} stroke="#fff" strokeWidth="1.5" className="transition-all hover:r-6 cursor-pointer" />;
              })}
            </svg>
          </div>
        </div>

        {/* Right: Key Insight (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              KEY INSIGHT
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Hybrid XAI with uncertainty-weighted fusion consistently achieves higher explanation reliability for the
              same level of prediction performance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-1">
            <span className="font-bold block">Summary Takeaway</span>
            <p className="text-[10px] text-blue-800">
              Multi-explainer consensus removes high-frequency gradient noise without sacrificing clinical localization.
            </p>
          </div>
        </div>
      </div>

      {/* New Experiment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Configure New Experiment</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Dataset</label>
                <select
                  value={newExpDataset}
                  onChange={(e) => setNewExpDataset(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-slate-800 bg-slate-50"
                >
                  <option value="CheXpert">CheXpert (Chest Radiographs)</option>
                  <option value="ISIC">ISIC 2024 (Dermoscopy)</option>
                  <option value="BraTS">BraTS 2023 (Brain MRI)</option>
                  <option value="VinDr-CXR">VinDr-CXR (External Holdout)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Model Architecture</label>
                <select
                  value={newExpModel}
                  onChange={(e) => setNewExpModel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-slate-800 bg-slate-50"
                >
                  <option value="DenseNet-121">DenseNet-121 (Radiology Backbone)</option>
                  <option value="ResNet-50">ResNet-50 (Deep Benchmark)</option>
                  <option value="EfficientNet-B0">EfficientNet-B0 (Dermoscopy)</option>
                  <option value="ViT-B/16">Vision Transformer (ViT-B/16)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">XAI Strategy</label>
                <select
                  value={newExpMethod}
                  onChange={(e) => setNewExpMethod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-slate-800 bg-slate-50"
                >
                  <option value="Hybrid (4-XAI)">Hybrid (4-XAI Multi-Consensus)</option>
                  <option value="Hybrid (3-XAI)">Hybrid (3-XAI Saliency)</option>
                  <option value="Grad-CAM++">Grad-CAM++ (Solitary Baseline)</option>
                  <option value="SHAP">SHAP (Solitary Baseline)</option>
                  <option value="Integrated Gradients">Integrated Gradients (Solitary Baseline)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fusion Strategy</label>
                <select
                  value={newExpFusion}
                  onChange={(e) => setNewExpFusion(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-slate-800 bg-slate-50"
                >
                  <option value="Uncertainty-Weighted v2">Uncertainty-Weighted v2 (Recommended)</option>
                  <option value="Entropy-Gated Consensus">Entropy-Gated Consensus</option>
                  <option value="Equal-Weight Average">Equal-Weight Average</option>
                  <option value="—">None (Single XAI)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExperiment}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-2xs flex items-center space-x-1"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Launch &amp; Record Experiment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExperimentsView;
