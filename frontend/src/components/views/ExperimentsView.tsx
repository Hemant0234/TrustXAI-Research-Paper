import React, { useState } from 'react';
import { Plus, Filter, Calendar } from 'lucide-react';

export const ExperimentsView: React.FC = () => {
  const experiments = [
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

  // Scatter plot points
  const scatterPoints = [
    { xqi: 72, rel: 69, type: 'single' },
    { xqi: 75, rel: 74, type: 'single' },
    { xqi: 78, rel: 76, type: 'single' },
    { xqi: 81, rel: 84, type: 'hybrid-mid' },
    { xqi: 82, rel: 85, type: 'hybrid-mid' },
    { xqi: 84, rel: 88, type: 'hybrid-high' },
    { xqi: 87, rel: 92, type: 'hybrid-high' },
    { xqi: 88, rel: 93, type: 'hybrid-high' },
    { xqi: 89, rel: 94, type: 'hybrid-high' }
  ];

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Experiment Comparison
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Compare different XAI configurations
          </p>
        </div>

        {/* Right filters & action button */}
        <div className="flex flex-wrap items-center gap-2">
          <select className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium">
            <option>Filter: All Datasets</option>
            <option>CheXpert</option>
            <option>ISIC</option>
            <option>BraTS</option>
          </select>

          <select className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium">
            <option>All Models</option>
            <option>DenseNet-121</option>
            <option>ResNet-50</option>
            <option>EfficientNet-B0</option>
          </select>

          <select className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium">
            <option>All XAI Methods</option>
            <option>Hybrid (4-XAI)</option>
            <option>Single XAI</option>
          </select>

          <div className="flex items-center space-x-1 text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-500">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Apr 1, 2026 – May 12, 2026</span>
          </div>

          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-md shadow-2xs flex items-center space-x-1">
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
                <th className="py-2.5 px-3">Fusion</th>
                <th className="py-2.5 px-3">XQI</th>
                <th className="py-2.5 px-3">Reliability</th>
                <th className="py-2.5 px-3">AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {experiments.map((e) => (
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
              XQI VS RELIABILITY
            </div>
            <div className="flex items-center space-x-3 text-[10px] text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Hybrid (80-100)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Hybrid (60-80)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Single XAI</span>
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
                const cx = 30 + ((pt.xqi - 60) / 40) * 260;
                const cy = 110 - ((pt.rel - 60) / 40) * 100;
                const fill =
                  pt.type === 'hybrid-high'
                    ? '#2563eb'
                    : pt.type === 'hybrid-mid'
                    ? '#06b6d4'
                    : '#94a3b8';
                return <circle key={i} cx={cx} cy={cy} r="4" fill={fill} stroke="#fff" strokeWidth="1" />;
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
              Hybrid XAI with weighted fusion consistently achieves higher explanation reliability for the
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
    </div>
  );
};
