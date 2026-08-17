import React from 'react';
import { Gauge, AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import { UncertaintyResult, ReliabilityAssessment } from '../../types';

interface UncertaintyCardProps {
  uncertainty: UncertaintyResult;
  confidenceProb: number;
  reliability: ReliabilityAssessment;
}

export const UncertaintyCard: React.FC<UncertaintyCardProps> = ({
  uncertainty,
  confidenceProb,
  reliability
}) => {
  const confPercent = Math.round(confidenceProb * 100);
  const uncPercent = Math.round(uncertainty.score * 100);
  const relPercent = Math.round(reliability.score);

  // Color mapping for uncertainty level
  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'high':
      case 'very_high':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const isDiscordant = confPercent >= 85 && relPercent < 60;

  return (
    <div className="bg-white rounded-xl border border-clinical-200 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Gauge className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-700">
            Predictive Uncertainty Module
          </span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 font-bold uppercase rounded-full border ${getLevelBadge(
            uncertainty.level
          )}`}
        >
          {uncertainty.level.replace('_', ' ')} UNCERTAINTY
        </span>
      </div>

      {/* Uncertainty Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-clinical-50 border border-clinical-100">
          <span className="text-[10px] text-clinical-500 font-medium block">Uncertainty Score</span>
          <span className="text-base font-bold font-mono text-clinical-900">
            {uncertainty.score.toFixed(2)}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-clinical-50 border border-clinical-100">
          <span className="text-[10px] text-clinical-500 font-medium block">Norm. Entropy</span>
          <span className="text-base font-bold font-mono text-clinical-900">
            {uncertainty.entropy.toFixed(2)}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-clinical-50 border border-clinical-100">
          <span className="text-[10px] text-clinical-500 font-medium block">Calibration (ECE)</span>
          <span className="text-base font-bold font-mono text-clinical-900">
            {uncertainty.calibration_error.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Visual Uncertainty Gauge Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-clinical-600">Dispersion Gauge</span>
          <span className="font-mono text-clinical-800">{uncPercent}%</span>
        </div>
        <div className="w-full bg-clinical-100 rounded-full h-2 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${
              uncertainty.level === 'low'
                ? 'bg-emerald-500'
                : uncertainty.level === 'moderate'
                ? 'bg-amber-500'
                : 'bg-rose-600'
            }`}
            style={{ width: `${uncPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-clinical-500 leading-tight">
          {uncertainty.interpretation}
        </p>
      </div>

      {/* CORE RESEARCH CARD: Uncertainty -> Explanation Reliability Alignment */}
      <div
        className={`p-3 rounded-lg border text-xs space-y-2 ${
          isDiscordant
            ? 'bg-rose-50/80 border-rose-200 text-rose-900'
            : uncertainty.alignment_with_confidence === 'HIGH'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            {isDiscordant ? (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>Uncertainty → Explanation Alignment</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded font-mono font-bold ${
              isDiscordant
                ? 'bg-rose-200 text-rose-900'
                : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {isDiscordant ? 'CRITICAL DISCORDANCE' : `${uncertainty.alignment_with_confidence} ALIGNMENT`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1 border-t border-current/10">
          <div>
            <span className="opacity-75 block">Prediction Confidence:</span>
            <span className="font-mono font-bold text-sm">{confPercent}%</span>
          </div>
          <div>
            <span className="opacity-75 block">Explanation Reliability:</span>
            <span className="font-mono font-bold text-sm">{relPercent}%</span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed pt-1">
          {isDiscordant ? (
            <strong className="text-rose-700 font-semibold block">
              ⚠️ High prediction confidence ({confPercent}%) does NOT guarantee a faithful explanation.
              Attribution maps exhibit high spatial discordance and instability.
            </strong>
          ) : (
            <span>
              The model is confident ({confPercent}%) and the explanation is consistent with available
              explanation-quality and stability evidence ({relPercent}%).
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
