import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { ReliabilityAssessment, UncertaintyResult, XQIDimensions } from '../../types';

interface TrustAssessmentPanelProps {
  reliability: ReliabilityAssessment;
  uncertainty: UncertaintyResult;
  xqi: XQIDimensions;
  confidenceProb: number;
}

export const TrustAssessmentPanel: React.FC<TrustAssessmentPanelProps> = ({
  reliability,
  uncertainty,
  xqi,
  confidenceProb
}) => {
  const isReliable = reliability.level === 'RELIABLE';
  const isCaution = reliability.level === 'CAUTION';
  const isReviewRequired = reliability.level === 'REVIEW REQUIRED';

  const getStatusTheme = () => {
    if (isReliable) {
      return {
        bg: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
        badge: 'bg-emerald-700 text-white',
        icon: ShieldCheck,
        accent: 'text-emerald-700'
      };
    } else if (isCaution) {
      return {
        bg: 'bg-amber-50/90 border-amber-300 text-amber-950',
        badge: 'bg-amber-600 text-white',
        icon: AlertTriangle,
        accent: 'text-amber-700'
      };
    } else {
      return {
        bg: 'bg-rose-50/95 border-rose-300 text-rose-950',
        badge: 'bg-rose-700 text-white',
        icon: ShieldAlert,
        accent: 'text-rose-700'
      };
    }
  };

  const theme = getStatusTheme();
  const Icon = theme.icon;

  return (
    <div className={`rounded-xl border shadow-sm p-4 space-y-4 transition-all ${theme.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-current/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg bg-white shadow-2xs ${theme.accent}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-900 block">
              Clinical Decision Support
            </span>
            <span className="text-xs font-extrabold text-clinical-900 tracking-tight">
              Should This Explanation Be Trusted?
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-clinical-600 block">
            Research Reliability
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono tracking-tight text-clinical-900">
              {Math.round(reliability.score)}
            </span>
            <span className="text-xs font-bold text-clinical-600 font-mono">/ 100</span>
          </div>
        </div>
      </div>

      {/* Trust Verdict Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${theme.badge}`}>
            {reliability.level}
          </span>
          <span className="text-xs font-semibold text-clinical-800">
            {reliability.trust_verdict}
          </span>
        </div>
      </div>

      {/* Supporting Evidence Breakdown */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-clinical-700 block">
          Evaluation Evidence Checklist
        </span>

        <div className="space-y-1.5 text-xs">
          {reliability.evidence_positive.map((ev, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-clinical-800">
              <div className="p-0.5 rounded bg-emerald-600 text-white shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <span className="leading-snug">{ev}</span>
            </div>
          ))}

          {reliability.evidence_concerns.map((ev, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-rose-900 font-medium">
              <div className="p-0.5 rounded bg-rose-600 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-3 h-3" />
              </div>
              <span className="leading-snug">{ev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Recommendation Text Box */}
      <div className="bg-white/80 rounded-lg p-3 border border-current/10 text-xs text-clinical-800 space-y-1">
        <span className="font-bold text-[11px] uppercase tracking-wider text-clinical-600 block">
          Recommendation for Clinician Reviewer
        </span>
        <p className="leading-relaxed font-medium">
          {reliability.clinical_recommendation}
        </p>
      </div>

      {/* Safety Notice Footer */}
      <div className="flex items-center space-x-1.5 text-[10px] text-clinical-500 border-t border-current/10 pt-2">
        <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
        <span>
          Decision support assessment only. Does not replace certified clinical radiological judgment.
        </span>
      </div>
    </div>
  );
};
