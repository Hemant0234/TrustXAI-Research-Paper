import React from 'react';
import { Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { SaliencyMapData } from '../../types';

interface ExplainerCardsProps {
  explanations: Record<string, SaliencyMapData>;
  selectedMethod?: string;
  onSelectMethod?: (method: string) => void;
}

export const ExplainerCards: React.FC<ExplainerCardsProps> = ({
  explanations,
  selectedMethod,
  onSelectMethod
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-clinical-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-700">
            Multi-XAI Explainer Ensemble (4 Methods)
          </span>
        </div>
        <span className="text-[11px] text-clinical-500">
          Independent Attributions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {Object.entries(explanations).map(([name, exp]) => {
          const isSelected = selectedMethod === name;
          return (
            <div
              key={name}
              onClick={() => onSelectMethod && onSelectMethod(name)}
              className={`bg-white rounded-xl border p-3.5 space-y-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
                  : 'border-clinical-200 hover:border-clinical-300 shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-clinical-900">{name}</div>
                  <div className="text-[10px] text-clinical-500 font-mono">
                    {exp.provenance?.target_layer || exp.provenance?.algorithm || 'Standard Layer'}
                  </div>
                </div>
                {exp.provenance?.simulated && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    SIMULATED
                  </span>
                )}
              </div>

              {/* Metric Breakdown Bars */}
              <div className="space-y-1.5 text-[11px]">
                {/* Faithfulness */}
                <div>
                  <div className="flex justify-between text-clinical-600">
                    <span>Faithfulness</span>
                    <span className="font-mono font-semibold text-clinical-800">
                      {Math.round(exp.faithfulness)}
                    </span>
                  </div>
                  <div className="w-full bg-clinical-100 rounded-full h-1 mt-0.5">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: `${exp.faithfulness}%` }}
                    />
                  </div>
                </div>

                {/* Localization */}
                <div>
                  <div className="flex justify-between text-clinical-600">
                    <span>Localization</span>
                    <span className="font-mono font-semibold text-clinical-800">
                      {exp.localization !== null && exp.localization !== undefined
                        ? Math.round(exp.localization)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-clinical-100 rounded-full h-1 mt-0.5">
                    <div
                      className="bg-emerald-600 h-1 rounded-full"
                      style={{ width: `${exp.localization || 0}%` }}
                    />
                  </div>
                </div>

                {/* Stability */}
                <div>
                  <div className="flex justify-between text-clinical-600">
                    <span>Stability</span>
                    <span className="font-mono font-semibold text-clinical-800">
                      {Math.round(exp.stability)}
                    </span>
                  </div>
                  <div className="w-full bg-clinical-100 rounded-full h-1 mt-0.5">
                    <div
                      className="bg-indigo-600 h-1 rounded-full"
                      style={{ width: `${exp.stability}%` }}
                    />
                  </div>
                </div>

                {/* Robustness */}
                <div>
                  <div className="flex justify-between text-clinical-600">
                    <span>Robustness</span>
                    <span className="font-mono font-semibold text-clinical-800">
                      {Math.round(exp.robustness)}
                    </span>
                  </div>
                  <div className="w-full bg-clinical-100 rounded-full h-1 mt-0.5">
                    <div
                      className="bg-slate-600 h-1 rounded-full"
                      style={{ width: `${exp.robustness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
