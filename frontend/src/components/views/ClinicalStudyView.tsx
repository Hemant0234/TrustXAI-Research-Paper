import React, { useState } from 'react';
import { Download, Stethoscope, CheckCircle, Clock, Star, Plus, Check, Loader2, Sparkles } from 'lucide-react';

export const ClinicalStudyView: React.FC = () => {
  const [trustBars, setTrustBars] = useState([
    { arm: 'A', val: 2.41, height: '48%' },
    { arm: 'B', val: 3.04, height: '60%' },
    { arm: 'C', val: 3.62, height: '72%' },
    { arm: 'D', val: 4.21, height: '84%' }
  ]);

  const initialResponses = [
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

  const [responses, setResponses] = useState(initialResponses);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Record Form State
  const [participantId, setParticipantId] = useState<string>('P-14');
  const [caseId, setCaseId] = useState<string>('TX-2048');
  const [decision, setDecision] = useState<string>('Correct');
  const [confidence, setConfidence] = useState<number>(5);
  const [trust, setTrust] = useState<number>(5);
  const [latency, setLatency] = useState<number>(28);

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Participant,CaseID,Decision,Confidence_1to5,Trust_1to5,Latency_Seconds']
        .concat(responses.map((r) => `${r.pId},${r.caseId},${r.decision},${r.confidence},${r.trust},${r.time}`))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clinical_study_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Clinical study evaluation data exported to CSV.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRecordResponse = () => {
    const newEntry = {
      pId: participantId,
      caseId,
      decision,
      confidence,
      trust,
      time: latency
    };
    setResponses((prev) => [newEntry, ...prev]);
    setIsModalOpen(false);
    setToastMessage(`Evaluation recorded for participant ${participantId}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Study Workbench</h1>
          <p className="text-xs text-slate-500 font-medium">
            Human clinician evaluation of explanation usefulness &amp; trust calibration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Evaluation</span>
          </button>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Study Active
          </span>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Top Section: 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Participants
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{12 + responses.length - 3}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Cases Evaluated
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{240 + responses.length - 3}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Avg. Trust (Arm D)
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            4.21 <span className="text-xs font-normal text-slate-400">/5</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Accuracy (Arm D)
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">87.5%</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Study Progress
            </div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">72%</div>
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
                strokeDasharray="72 100"
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
            STUDY ARMS (EXPERIMENTAL CONDITIONS)
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2">
              <span className="font-bold text-slate-800 font-mono">A:</span>
              <span className="text-slate-600 font-medium">Prediction Only (Black Box)</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2">
              <span className="font-bold text-slate-800 font-mono">B:</span>
              <span className="text-slate-600 font-medium">Prediction + Grad-CAM++</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2">
              <span className="font-bold text-slate-800 font-mono">C:</span>
              <span className="text-slate-600 font-medium">Prediction + Hybrid Consensus</span>
            </div>
            <div className="p-2 rounded bg-blue-50/70 border border-blue-200 flex items-start space-x-2">
              <span className="font-bold text-blue-800 font-mono">D:</span>
              <span className="text-blue-900 font-semibold">
                Prediction + Hybrid XAI + XQI + Uncertainty Gating
              </span>
            </div>
          </div>
        </div>

        {/* Center: Trust Rating (1-5) Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            CLINICIAN TRUST RATING (1–5 LIKERT)
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
                <span className="text-xs font-bold text-slate-700 font-mono">Arm {b.arm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preference Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            CLINICIAN PREFERENCE (MOST ACTIONABLE)
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
                <span>Arm D: 48%</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Arm C: 31%</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Arm B: 17%</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Arm A: 4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Responses Table & Export Action */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recent Clinician Responses (Arm D Evaluation)
          </h2>
          <button
            onClick={handleExportData}
            className="text-xs bg-slate-900 hover:bg-black text-white font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Study Data (.CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Participant ID</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Diagnosis Decision</th>
                <th className="py-2.5 px-3">Confidence (1-5)</th>
                <th className="py-2.5 px-3">Explanation Trust (1-5)</th>
                <th className="py-2.5 px-3">Decision Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs font-mono">
              {responses.map((r, idx) => (
                <tr key={`${r.pId}-${idx}`} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{r.pId}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{r.caseId}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-emerald-700">
                    {r.decision}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{r.confidence} / 5</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{r.trust} / 5</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{r.time}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Evaluation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Record Clinician Evaluation</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Participant ID</label>
                  <input
                    type="text"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-200 font-mono text-slate-800 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Case ID</label>
                  <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-200 font-mono text-slate-800 bg-slate-50"
                  >
                    <option value="TX-2048">TX-2048 (Pneumonia)</option>
                    <option value="TX-2047">TX-2047 (Cardiomegaly)</option>
                    <option value="TX-2049">TX-2049 (Pleural Effusion)</option>
                    <option value="TX-3012">TX-3012 (Melanoma)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diagnostic Accuracy Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 text-slate-800 bg-slate-50"
                >
                  <option value="Correct">Correct (Pathology Verified)</option>
                  <option value="Incorrect">Incorrect (False Positive / Negative)</option>
                  <option value="Inconclusive">Inconclusive (Requires Biopsy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confidence (1–5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-1.5 rounded border border-slate-200 font-mono text-slate-800 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Explanation Trust (1–5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={trust}
                    onChange={(e) => setTrust(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-1.5 rounded border border-slate-200 font-mono text-slate-800 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision Latency (Seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={latency}
                  onChange={(e) => setLatency(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-1.5 rounded border border-slate-200 font-mono text-slate-800 bg-slate-50"
                />
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
                onClick={handleRecordResponse}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-2xs flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Evaluation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClinicalStudyView;
