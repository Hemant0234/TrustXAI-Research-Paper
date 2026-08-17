import React from 'react';
import { Sparkles, Layers } from 'lucide-react';
import { CaseAnalysis } from '../../types';

interface ExplanationLabViewProps {
  currentCase: CaseAnalysis;
  onRecalculateFusion?: (weights: Record<string, number>) => Promise<void>;
}

// Compact Radar chart component for XAI dimensions
const MiniRadarChart: React.FC<{
  faithfulness: number;
  localization: number;
  robustness: number;
  stability: number;
  consistency: number;
}> = ({ faithfulness, localization, robustness, stability, consistency }) => {
  const size = 160;
  const center = size / 2;
  const radius = 55;

  const metrics = [
    { label: 'Faithfulness', val: faithfulness, angle: -Math.PI / 2 },
    { label: 'Localization', val: localization, angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { label: 'Robustness', val: robustness, angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { label: 'Stability', val: stability, angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { label: 'Consistency', val: consistency, angle: -Math.PI / 2 + (8 * Math.PI) / 5 }
  ];

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getPolygonPoints = (level: number) => {
    return metrics
      .map((m) => {
        const x = center + radius * level * Math.cos(m.angle);
        const y = center + radius * level * Math.sin(m.angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const dataPoints = metrics
    .map((m) => {
      const norm = (m.val || 75) / 100;
      const x = center + radius * norm * Math.cos(m.angle);
      const y = center + radius * norm * Math.sin(m.angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-48 h-44 flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background polygon webs */}
        {gridLevels.map((lvl) => (
          <polygon
            key={lvl}
            points={getPolygonPoints(lvl)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Radial axes */}
        {metrics.map((m, idx) => (
          <line
            key={idx}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(m.angle)}
            y2={center + radius * Math.sin(m.angle)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon filled */}
        <polygon
          points={dataPoints}
          fill="rgba(16, 185, 129, 0.15)"
          stroke="#10b981"
          strokeWidth="1.5"
        />

        {/* Data point dots */}
        {metrics.map((m, idx) => {
          const norm = (m.val || 75) / 100;
          const x = center + radius * norm * Math.cos(m.angle);
          const y = center + radius * norm * Math.sin(m.angle);
          return <circle key={idx} cx={x} cy={y} r="2.5" fill="#10b981" />;
        })}

        {/* Vertex Labels */}
        {metrics.map((m, idx) => {
          const labelDist = radius + 15;
          const x = center + labelDist * Math.cos(m.angle);
          const y = center + labelDist * Math.sin(m.angle) + 3;
          return (
            <text
              key={idx}
              x={x}
              y={y}
              fontSize="8"
              fill="#64748b"
              fontFamily="sans-serif"
              textAnchor="middle"
              fontWeight="500"
            >
              {m.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export const ExplanationLabView: React.FC<ExplanationLabViewProps> = ({ currentCase }) => {
  const methodConfigs = [
    {
      id: 'Grad-CAM++',
      name: 'Grad-CAM++',
      score: 84,
      faithfulness: 88,
      localization: 93,
      robustness: 81,
      stability: 85,
      consistency: 90
    },
    {
      id: 'SHAP',
      name: 'SHAP',
      score: 79,
      faithfulness: 85,
      localization: 90,
      robustness: 78,
      stability: 82,
      consistency: 87
    },
    {
      id: 'Integrated Gradients',
      name: 'Integrated Gradients',
      score: 82,
      faithfulness: 91,
      localization: 94,
      robustness: 84,
      stability: 88,
      consistency: 92
    },
    {
      id: 'Attention Rollout',
      name: 'Attention Rollout',
      score: 76,
      faithfulness: 80,
      localization: 86,
      robustness: 75,
      stability: 79,
      consistency: 83
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Explanation Lab</h1>
          <p className="text-xs text-slate-500 font-medium">
            Multi-XAI explanations for {currentCase.case_id}
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Demo Mode
        </span>
      </div>

      {/* 2x2 Grid of Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methodConfigs.map((m) => {
          const isHigh = m.score >= 80;
          return (
            <div
              key={m.id}
              className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-400 font-medium">Overall Score</span>
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      isHigh
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {m.score}/100
                  </span>
                </div>
              </div>

              {/* Body: Saliency Heatmap Thumbnail on Left, Radar Chart on Right */}
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Saliency image preview */}
                <div className="w-full h-44 bg-black rounded-lg overflow-hidden relative shadow-inner border border-slate-800 flex items-center justify-center">
                  <img
                    src={currentCase.image_base64}
                    alt={m.name}
                    className="w-full h-full object-contain opacity-70"
                  />
                  <div
                    className={`absolute inset-0 ${
                      m.id === 'Grad-CAM++'
                        ? 'bg-red-500/25'
                        : m.id === 'SHAP'
                        ? 'bg-amber-500/25'
                        : m.id === 'Integrated Gradients'
                        ? 'bg-blue-500/25'
                        : 'bg-indigo-500/25'
                    } mix-blend-screen`}
                  />
                </div>

                {/* Radar Chart */}
                <div className="flex items-center justify-center">
                  <MiniRadarChart
                    faithfulness={m.faithfulness}
                    localization={m.localization}
                    robustness={m.robustness}
                    stability={m.stability}
                    consistency={m.consistency}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Legend Bar */}
      <div className="px-4 py-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Scores are normalized to 0-100. Human agreement (N/A) requires clinician study.
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Score ≥80</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>60-80</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>&lt;60</span>
          </div>
        </div>
      </div>
    </div>
  );
};
