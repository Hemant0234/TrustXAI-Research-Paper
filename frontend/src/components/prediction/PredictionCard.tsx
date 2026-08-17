import React, { useState } from 'react';
import { Activity, HelpCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { PredictionResult } from '../../types';

interface PredictionCardProps {
  prediction: PredictionResult;
  modelName: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, modelName }) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const confPercent = Math.round(prediction.probability * 1000) / 10;
  const sortedProbabilities = Object.entries(prediction.probabilities || {}).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="bg-white rounded-xl border border-clinical-200 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-700">
            AI Diagnostic Prediction
          </span>
        </div>
        <span className="text-[11px] text-clinical-500 font-mono">
          {modelName}
        </span>
      </div>

      {/* Main Diagnosis & Confidence */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs text-clinical-500 font-medium block">Predicted Finding</span>
          <span className="text-2xl font-extrabold text-clinical-900 tracking-tight">
            {prediction.label}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-clinical-500 font-medium block">Prediction Confidence</span>
          <span className="text-2xl font-bold font-mono text-blue-600">
            {confPercent}%
          </span>
        </div>
      </div>

      {/* Confidence vs Certainty Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700">
        <div
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center justify-between cursor-pointer font-medium select-none"
        >
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Confidence ≠ Diagnostic Certainty</span>
          </div>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
        {showExplanation && (
          <p className="mt-2 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
            Prediction confidence measures the model's estimated probability for the predicted class.
            Uncertainty estimates how reliable that prediction is under the selected uncertainty model.
            Never assume probability equals clinical truth.
          </p>
        )}
      </div>

      {/* Differential Findings Distribution */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-semibold text-clinical-600 block">
          Differential Distribution
        </span>
        <div className="space-y-1.5">
          {sortedProbabilities.map(([cls, prob]) => {
            const perc = Math.round(prob * 1000) / 10;
            const isTop = cls === prediction.label;
            return (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`truncate ${isTop ? 'font-bold text-clinical-900' : 'text-clinical-600'}`}>
                    {cls}
                  </span>
                  <span className="font-mono text-clinical-700 font-medium ml-2">
                    {perc}%
                  </span>
                </div>
                <div className="w-full bg-clinical-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    style={{ width: `${perc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
