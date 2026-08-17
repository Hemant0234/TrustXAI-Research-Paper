import React, { useState, useEffect } from 'react';
import { TestTubes, Download, Filter, ArrowUpDown, Check, Layers } from 'lucide-react';
import { ExperimentItem, AblationItem } from '../../types';
import { fetchExperiments, fetchAblationStudy } from '../../lib/api';

export const ExperimentsView: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [ablations, setAblations] = useState<AblationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'ablation'>('benchmarks');
  const [sortField, setSortField] = useState<keyof ExperimentItem>('mean_reliability');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  useEffect(() => {
    fetchExperiments().then(setExperiments).catch(console.error);
    fetchAblationStudy().then(setAblations).catch(console.error);
  }, []);

  const handleSort = (field: keyof ExperimentItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedExperiments = [...experiments].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Comparative Analysis
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
            Experiments & Ablation Benchmark Matrix
          </h1>
          <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
            Empirically validating each component of the pipeline: Single Explainers vs. Multi-XAI Ensemble vs.
            Quality-Aware Fusion vs. Full Uncertainty-Gated TrustXAI-Med.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 bg-clinical-100 p-1 rounded-xl border border-clinical-200 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-white text-clinical-900 shadow-xs'
                : 'text-clinical-600 hover:text-clinical-900'
            }`}
          >
            Experiment Registry
          </button>
          <button
            onClick={() => setActiveTab('ablation')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'ablation'
                ? 'bg-white text-clinical-900 shadow-xs'
                : 'text-clinical-600 hover:text-clinical-900'
            }`}
          >
            Ablation Study
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'benchmarks' ? (
        <div className="bg-white rounded-xl border border-clinical-200 shadow-sm overflow-hidden space-y-0">
          <div className="px-5 py-4 border-b border-clinical-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-clinical-900 uppercase tracking-wider">
                Benchmark Experiment Runs
              </h2>
              <p className="text-xs text-clinical-500 font-medium">
                Comparative evaluation across single explainers and unified hybrid fusion
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-clinical-700">
              <thead className="bg-clinical-50/80 text-clinical-600 border-b border-clinical-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Experiment ID</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">XAI Strategy</th>
                  <th className="py-3 px-4">Fusion Mechanism</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleSort('mean_xqi')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Mean XQI</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleSort('mean_reliability')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Reliability</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleSort('auc_roc')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>AUC-ROC</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-100 font-medium">
                {sortedExperiments.map((e) => {
                  const isHighlight = e.id === 'EXP-05';
                  return (
                    <tr
                      key={e.id}
                      className={`hover:bg-clinical-50/80 transition-colors ${
                        isHighlight ? 'bg-blue-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-clinical-900">
                        {e.id}
                      </td>
                      <td className="py-3 px-4 text-clinical-800">{e.model}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {e.xai_methods.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-clinical-100 text-[10px]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-clinical-600">{e.fusion_strategy}</td>
                      <td className="py-3 px-4 font-mono font-bold text-clinical-900">
                        {e.mean_xqi.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {e.mean_reliability.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600">
                        {e.auc_roc.toFixed(3)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isHighlight
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-clinical-100 text-clinical-700'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Ablation Study Matrix */
        <div className="bg-white rounded-xl border border-clinical-200 shadow-sm overflow-hidden space-y-0">
          <div className="px-5 py-4 border-b border-clinical-200">
            <h2 className="text-sm font-bold text-clinical-900 uppercase tracking-wider">
              Component Ablation Study
            </h2>
            <p className="text-xs text-clinical-500 font-medium">
              Progressive contribution of Multi-XAI, Adaptive Fusion, Uncertainty Gating, and XQI Calibration
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-clinical-700">
              <thead className="bg-clinical-50/80 text-clinical-600 border-b border-clinical-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Condition ID</th>
                  <th className="py-3 px-4">Pipeline Configuration</th>
                  <th className="py-3 px-4">Faithfulness</th>
                  <th className="py-3 px-4">Localization</th>
                  <th className="py-3 px-4">Stability</th>
                  <th className="py-3 px-4">Robustness</th>
                  <th className="py-3 px-4 font-bold text-clinical-900">XQI Score</th>
                  <th className="py-3 px-4 font-bold text-emerald-800">Reliability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-100 font-medium font-mono">
                {ablations.map((a) => {
                  const isFull = a.condition_id === 'ABL-06';
                  return (
                    <tr
                      key={a.condition_id}
                      className={`hover:bg-clinical-50/80 transition-colors ${
                        isFull ? 'bg-emerald-50/40 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-clinical-900">{a.condition_id}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-clinical-900">
                        <div>{a.name}</div>
                        <div className="text-[10px] text-clinical-500 font-normal">{a.description}</div>
                      </td>
                      <td className="py-3 px-4">{a.faithfulness > 0 ? a.faithfulness.toFixed(1) : '—'}</td>
                      <td className="py-3 px-4">{a.localization > 0 ? a.localization.toFixed(1) : '—'}</td>
                      <td className="py-3 px-4">{a.stability > 0 ? a.stability.toFixed(1) : '—'}</td>
                      <td className="py-3 px-4">{a.robustness > 0 ? a.robustness.toFixed(1) : '—'}</td>
                      <td className="py-3 px-4 text-clinical-900 font-extrabold">
                        {a.xqi > 0 ? a.xqi.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-extrabold">
                        {a.reliability > 0 ? a.reliability.toFixed(1) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
