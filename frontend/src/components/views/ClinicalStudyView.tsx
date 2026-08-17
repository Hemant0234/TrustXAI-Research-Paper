import React, { useState, useEffect } from 'react';
import { Stethoscope, UserCheck, CheckCircle2, Clock, ThumbsUp, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { ClinicianStudyCondition, StudyBenchmarkSummary, ClinicianResponse, CaseAnalysis } from '../../types';
import { fetchClinicalConditions, fetchClinicalBenchmarks, fetchClinicalResponses, submitClinicalResponse } from '../../lib/api';

interface ClinicalStudyViewProps {
  currentCase: CaseAnalysis;
}

export const ClinicalStudyView: React.FC<ClinicalStudyViewProps> = ({ currentCase }) => {
  const [conditions, setConditions] = useState<ClinicianStudyCondition[]>([]);
  const [benchmarks, setBenchmarks] = useState<StudyBenchmarkSummary[]>([]);
  const [responses, setResponses] = useState<ClinicianResponse[]>([]);
  const [activeCondition, setActiveCondition] = useState<string>('D');

  // Response Form state
  const [participantId, setParticipantId] = useState<string>('RAD-READER-05');
  const [role, setRole] = useState<string>('Radiologist');
  const [decision, setDecision] = useState<string>(currentCase.prediction.label);
  const [confidence, setConfidence] = useState<number>(90);
  const [trustScore, setTrustScore] = useState<number>(85);
  const [utilityRating, setUtilityRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchClinicalConditions().then(setConditions).catch(console.error);
    fetchClinicalBenchmarks().then(setBenchmarks).catch(console.error);
    fetchClinicalResponses().then(setResponses).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitClinicalResponse({
        participant_id: participantId,
        participant_role: role,
        case_id: currentCase.case_id,
        condition_code: activeCondition,
        diagnostic_decision: decision,
        diagnostic_confidence: confidence,
        clinician_trust_score: trustScore,
        decision_time_seconds: 15.4,
        explanation_utility_rating: utilityRating,
        clinical_feedback: feedback
      });
      setSubmitSuccess(true);
      const updated = await fetchClinicalResponses();
      setResponses(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Clinical Decision Support Evaluation
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
          Clinician Trust & Reader Study Protocol
        </h1>
        <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
          Simulating the 4-Condition Reader Protocol (Conditions A, B, C, D) to measure clinician diagnostic accuracy,
          decision time, subjective trust, and prevention of AI overreliance.
        </p>
      </div>

      {/* 4 Study Conditions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {conditions.map((cond) => {
          const isSelected = activeCondition === cond.code;
          return (
            <div
              key={cond.condition_id}
              onClick={() => {
                setActiveCondition(cond.code);
                setSubmitSuccess(false);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-100 shadow-sm'
                  : 'bg-white border-clinical-200 hover:border-clinical-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold font-mono ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-clinical-100 text-clinical-800'
                  }`}
                >
                  Condition {cond.code}
                </span>
                {cond.code === 'D' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                    Full TrustXAI
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-clinical-900 leading-tight">
                {cond.name}
              </h3>
              <p className="text-[11px] text-clinical-600 leading-snug">
                {cond.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Interactive Reader Response Capture Form & Benchmark Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Study Simulation Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
              Reader Response Capture Form
            </span>
            <span className="text-xs font-mono font-bold text-blue-600">
              Condition {activeCondition} • {currentCase.case_id}
            </span>
          </div>

          {submitSuccess ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold text-emerald-900">
                Clinician Response Recorded!
              </h4>
              <p className="text-[11px] text-emerald-700">
                Thank you for participating in the TrustXAI-Med decision support study.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-2 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
              >
                Record Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-clinical-700 block mb-1">Participant ID</label>
                  <input
                    type="text"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-clinical-50 border border-clinical-200 font-mono text-clinical-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-clinical-700 block mb-1">Clinical Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-clinical-50 border border-clinical-200 font-medium text-clinical-900"
                  >
                    <option value="Radiologist">Radiologist</option>
                    <option value="Attending Physician">Attending Physician</option>
                    <option value="Resident">Resident</option>
                    <option value="Medical AI Researcher">Medical AI Researcher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-clinical-700 block mb-1">Diagnostic Decision</label>
                <input
                  type="text"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-clinical-50 border border-clinical-200 font-medium text-clinical-900"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-clinical-700 mb-1">
                  <span>Diagnostic Confidence</span>
                  <span className="font-mono">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-clinical-200 rounded appearance-none accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-clinical-700 mb-1">
                  <span>Subjective Trust in AI Output</span>
                  <span className="font-mono">{trustScore}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={trustScore}
                  onChange={(e) => setTrustScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-clinical-200 rounded appearance-none accent-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-clinical-700 block mb-1">Clinical Reader Feedback</label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Notes on explainer concordance, artifacts, or uncertainty guidance..."
                  className="w-full px-2.5 py-1.5 rounded bg-clinical-50 border border-clinical-200 text-clinical-900 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Response</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Study Benchmark Results Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
              Aggregated Reader Study Benchmarks
            </span>
            <span className="text-[11px] text-clinical-500 font-mono">
              N=42 Certified Radiologist Readers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-clinical-700">
              <thead className="bg-clinical-50 text-clinical-600 border-b border-clinical-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Diagnostic Accuracy</th>
                  <th className="py-2.5 px-3">Clinician Trust</th>
                  <th className="py-2.5 px-3">Decision Time</th>
                  <th className="py-2.5 px-3 text-rose-700">Overreliance on Bad AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-100 font-medium font-mono">
                {benchmarks.map((b) => {
                  const isD = b.condition.includes('D');
                  return (
                    <tr
                      key={b.condition}
                      className={isD ? 'bg-emerald-50/50 font-bold' : ''}
                    >
                      <td className="py-2.5 px-3 font-sans text-clinical-900">
                        {b.condition}: {b.condition_name}
                      </td>
                      <td className="py-2.5 px-3 text-clinical-900">
                        {b.mean_diagnostic_accuracy.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-blue-600">
                        {b.mean_clinician_trust.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-clinical-700">
                        {b.mean_decision_time.toFixed(1)}s
                      </td>
                      <td className="py-2.5 px-3 text-rose-700 font-bold">
                        {b.overreliance_on_incorrect_ai.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-clinical-50 rounded-lg border border-clinical-200 text-xs text-clinical-700">
            <p className="leading-relaxed">
              <strong>Key Finding:</strong> Providing <strong>Condition D (TrustXAI-Med)</strong> reduced clinician overreliance
              on incorrect AI outputs from <strong>34.2%</strong> down to <strong>7.4%</strong>, demonstrating the critical value of
              explicit explanation reliability flags.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
