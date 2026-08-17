import React from 'react';
import { Download, Stethoscope, CheckCircle, Clock, Star } from 'lucide-react';

export const ClinicalStudyView: React.FC = () => {
  const trustBars = [
    { arm: 'A', val: 2.41, height: '48%' },
    { arm: 'B', val: 3.04, height: '60%' },
    { arm: 'C', val: 3.62, height: '72%' },
    { arm: 'D', val: 4.21, height: '84%' }
  ];

  const recentResponses = [
    {
      pId: 'P-07',
      caseId: 'TX-2048',
      decision: 'Correct',
      confidence: 5,
      trust: 5,
      time: 38
    },
    {
      pId: 'P-03',
      caseId: 'TX-2047',
      decision: 'Correct',
      confidence: 4,
      trust: 4,
      time: 42
    },
    {
      pId: 'P-11',
      caseId: 'TX-2046',
      decision: 'Correct',
      confidence: 4,
      trust: 4,
      time: 35
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Study</h1>
          <p className="text-xs text-slate-500 font-medium">
            Human evaluation of explanation usefulness
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Demo Mode
        </span>
      </div>

      {/* Top Section: 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Participants
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">12</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Cases Evaluated
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">240</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Avg. Trust (D)
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            4.21 <span className="text-xs font-normal text-slate-400">/5</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Accuracy (D)
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">87.5%</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Study Progress
            </div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">68%</div>
          </div>
          {/* Circular progress */}
          <div className="w-10 h-10 relative shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray="68 100"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Row: Study Arms, Trust Rating Chart, and Preference Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Study Arms (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            STUDY ARMS
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2">
              <span className="font-bold text-slate-800 font-mono">A:</span>
              <span className="text-slate-600 font-medium">Prediction Only</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2">
              <span className="font-bold text-slate-800 font-mono">B:</span>
              <span className="text-slate-600 font-medium">Prediction + Grad-CAM</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2">
              <span className="font-bold text-slate-800 font-mono">C:</span>
              <span className="text-slate-600 font-medium">Prediction + Hybrid XAI</span>
            </div>
            <div className="p-2 rounded bg-blue-50/70 border border-blue-200 flex items-start space-x-2">
              <span className="font-bold text-blue-800 font-mono">D:</span>
              <span className="text-blue-900 font-semibold">
                Prediction + Hybrid XAI + XQI + Uncertainty
              </span>
            </div>
          </div>
        </div>

        {/* Center: Trust Rating (1-5) Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            TRUST RATING (1–5)
          </div>

          <div className="h-44 flex items-end justify-around px-2 pt-4 pb-2 border-b border-slate-100">
            {trustBars.map((b) => (
              <div key={b.arm} className="flex flex-col items-center space-y-2">
                <span className="font-mono font-bold text-xs text-slate-800">{b.val}</span>
                <div className="w-10 bg-slate-100 rounded-t overflow-hidden flex items-end h-28">
                  <div
                    className={`w-full rounded-t transition-all ${
                      b.arm === 'D' ? 'bg-blue-600' : 'bg-blue-400/70'
                    }`}
                    style={{ height: b.height }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 font-mono">{b.arm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preference Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            PREFERENCE (MOST HELPFUL)
          </div>

          <div className="flex items-center justify-center space-x-4 h-44">
            {/* SVG Donut / Pie */}
            <div className="w-24 h-24 relative shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="12" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="18" cy="18" r="12" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="48 52" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="12" fill="none" stroke="#06b6d4" strokeWidth="10" strokeDasharray="31 69" strokeDashoffset="-48" />
                <circle cx="18" cy="18" r="12" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="17 83" strokeDashoffset="-79" />
                <circle cx="18" cy="18" r="12" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="4 96" strokeDashoffset="-96" />
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>D: 48%</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>C: 31%</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>B: 17%</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>A: 4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Responses (Arm D) Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recent Responses (Arm D)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Diagnosis Decision</th>
                <th className="py-2.5 px-3">Confidence (1-5)</th>
                <th className="py-2.5 px-3">Trust (1-5)</th>
                <th className="py-2.5 px-3">Time (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs font-mono">
              {recentResponses.map((r) => (
                <tr key={r.pId} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{r.pId}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{r.caseId}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-emerald-700">
                    {r.decision}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{r.confidence}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{r.trust}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{r.time}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar with Export Button */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Study in progress. Results are preliminary and for research use only.
          </span>
          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center space-x-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export Study Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
