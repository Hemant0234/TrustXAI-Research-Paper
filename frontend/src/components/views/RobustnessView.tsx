import React from 'react';
import { ShieldCheck, Sliders } from 'lucide-react';
import { CaseAnalysis } from '../../types';

interface RobustnessViewProps {
  currentCase: CaseAnalysis;
  onRunPerturbation?: (type: string, intensity: number) => Promise<any>;
}

export const RobustnessView: React.FC<RobustnessViewProps> = ({ currentCase }) => {
  const perturbations = [
    { type: 'Original', ssim: '1.000', xqi: 87, loc: '100%' },
    { type: 'Gaussian Noise (σ=0.1)', ssim: '0.942', xqi: 85, loc: '96%' },
    { type: 'Brightness (+20%)', ssim: '0.976', xqi: 86, loc: '99%' },
    { type: 'Contrast (-20%)', ssim: '0.951', xqi: 84, loc: '94%' },
    { type: 'Gaussian Blur (5x5)', ssim: '0.905', xqi: 81, loc: '93%' },
    { type: 'JPEG Compression (50%)', ssim: '0.908', xqi: 80, loc: '92%' },
    { type: 'Rotation (5°)', ssim: '0.929', xqi: 83, loc: '94%' },
    { type: 'Random Crop (80%)', ssim: '0.889', xqi: 79, loc: '91%' }
  ];

  // SVG Line Chart for XQI across perturbations
  const chartPoints = [
    { x: 20, y: 30, val: 87 },
    { x: 50, y: 38, val: 85 },
    { x: 80, y: 34, val: 86 },
    { x: 110, y: 42, val: 84 },
    { x: 140, y: 55, val: 81 },
    { x: 170, y: 58, val: 80 },
    { x: 200, y: 46, val: 83 },
    { x: 230, y: 62, val: 79 }
  ];

  const pathD = `M ${chartPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Robustness Lab</h1>
          <p className="text-xs text-slate-500 font-medium">
            Perturbation stability analysis for {currentCase.case_id}
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Demo Mode
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Perturbation Comparison Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Perturbation Type</th>
                  <th className="py-2.5 px-3">Perturbed Input</th>
                  <th className="py-2.5 px-3">Fused Explanation</th>
                  <th className="py-2.5 px-3">Similarity (SSIM)</th>
                  <th className="py-2.5 px-3">XQI</th>
                  <th className="py-2.5 px-3">Localization Consistency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {perturbations.map((p, idx) => (
                  <tr key={p.type} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-semibold text-slate-800 text-xs">
                      {p.type}
                    </td>
                    <td className="py-2 px-3">
                      <div className="w-9 h-9 bg-black rounded overflow-hidden relative border border-slate-700 flex items-center justify-center">
                        <img
                          src={currentCase.image_base64}
                          alt="Perturbed"
                          className={`w-full h-full object-contain opacity-70 ${
                            idx === 1 ? 'contrast-125' : idx === 2 ? 'brightness-125' : ''
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="w-9 h-9 bg-black rounded overflow-hidden relative border border-slate-700 flex items-center justify-center">
                        <img
                          src={currentCase.image_base64}
                          alt="Fused"
                          className="w-full h-full object-contain opacity-70"
                        />
                        <div className="absolute inset-0 bg-blue-500/30 mix-blend-screen" />
                      </div>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800 text-xs">
                      {p.ssim}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800 text-xs">
                      {p.xqi}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800 text-xs">
                      {p.loc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Stability Score Card & XQI Across Perturbations Line Chart (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Perturbation Stability Score */}
          <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              PERTURBATION STABILITY SCORE
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-emerald-600">94%</span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                HIGHLY STABLE
              </span>
            </div>
          </div>

          {/* Card 2: XQI Across Perturbations Chart */}
          <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              XQI ACROSS PERTURBATIONS
            </div>

            {/* SVG Line Chart */}
            <div className="w-full h-32 relative">
              <svg viewBox="0 0 250 100" className="w-full h-full">
                {/* Horizontal Grid lines */}
                <line x1="15" y1="20" x2="245" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="15" y1="40" x2="245" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="15" y1="60" x2="245" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="15" y1="80" x2="245" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="5" y="23" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">90</text>
                <text x="5" y="43" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">85</text>
                <text x="5" y="63" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">80</text>
                <text x="5" y="83" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">75</text>

                {/* Line Path */}
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />

                {/* Circles */}
                {chartPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
                ))}
              </svg>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              This explanation remains stable across common image perturbations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
