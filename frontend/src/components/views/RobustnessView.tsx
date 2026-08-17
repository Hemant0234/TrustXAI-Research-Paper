import React, { useState, useEffect, useRef } from 'react';
import { Sliders, RefreshCw, Activity, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CaseAnalysis, PerturbationResult } from '../../types';
import { runPerturbationTest } from '../../lib/api';

interface RobustnessViewProps {
  currentCase: CaseAnalysis;
}

export const RobustnessView: React.FC<RobustnessViewProps> = ({ currentCase }) => {
  const [perturbationType, setPerturbationType] = useState<string>('gaussian_noise');
  const [intensity, setIntensity] = useState<number>(0.30);
  const [selectedMethod, setSelectedMethod] = useState<string>('Grad-CAM++');
  const [result, setResult] = useState<PerturbationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const canvasPerturbedRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDiffRef = useRef<HTMLCanvasElement | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const data = await runPerturbationTest(
        currentCase.case_id,
        perturbationType,
        intensity,
        selectedMethod
      );
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRun();
  }, [currentCase.case_id, perturbationType, intensity, selectedMethod]);

  // Render perturbed and difference heatmaps onto canvas
  useEffect(() => {
    if (!result) return;

    const renderMat = (canvas: HTMLCanvasElement | null, matrix: number[][], isDiff: boolean) => {
      if (!canvas || !matrix || matrix.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = matrix.length;
      canvas.width = 256;
      canvas.height = 256;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;

      const scaleX = size / canvas.width;
      const scaleY = size / canvas.height;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const gridY = Math.min(size - 1, Math.floor(y * scaleY));
          const gridX = Math.min(size - 1, Math.floor(x * scaleX));
          const rawVal = matrix[gridY]?.[gridX] || 0;
          const idx = (y * canvas.width + x) * 4;

          if (rawVal < 0.1) {
            data[idx + 3] = 0;
            continue;
          }

          if (isDiff) {
            // Difference in crimson
            data[idx] = Math.floor(220 * rawVal);
            data[idx + 1] = 0;
            data[idx + 2] = Math.floor(60 * (1 - rawVal));
            data[idx + 3] = Math.floor(200 * rawVal);
          } else {
            // Jet-like perturbed overlay
            data[idx] = Math.floor(255 * rawVal);
            data[idx + 1] = Math.floor(180 * (1 - rawVal));
            data[idx + 2] = Math.floor(255 * (1 - rawVal));
            data[idx + 3] = Math.floor(180 * rawVal);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    renderMat(canvasPerturbedRef.current, result.perturbed_matrix, false);
    renderMat(canvasDiffRef.current, result.difference_matrix, true);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Perturbation & Stress Testing
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
          Explanation Robustness & Stability Lab
        </h1>
        <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
          Evaluates explanation invariance under synthetic clinical perturbations (sensor noise, illumination shifts, blur, and affine transformations)
          to ensure heatmaps do not suffer catastrophic semantic drift.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl border border-clinical-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Perturbation selector */}
        <div className="space-y-1.5">
          <span className="font-semibold text-clinical-700 block">Perturbation Transformation</span>
          <select
            value={perturbationType}
            onChange={(e) => setPerturbationType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-clinical-50 border border-clinical-200 font-medium text-clinical-900"
          >
            <option value="gaussian_noise">Gaussian Sensor Noise (N(0, σ²))</option>
            <option value="blur">Gaussian Acquisition Blur</option>
            <option value="contrast">Contrast Attenuation / Gain</option>
            <option value="brightness">Photometric Illumination Shift</option>
            <option value="rotation">Patient Position Rotation (±10°)</option>
            <option value="crop">Field-of-View Margin Cropping</option>
          </select>
        </div>

        {/* Severity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-semibold text-clinical-700">
            <span>Perturbation Severity (Intensity)</span>
            <span className="font-mono font-bold">{Math.round(intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.80"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-clinical-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
          />
        </div>

        {/* Explainer Target */}
        <div className="space-y-1.5">
          <span className="font-semibold text-clinical-700 block">Target Explainer Under Test</span>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-clinical-50 border border-clinical-200 font-medium text-clinical-900"
          >
            <option value="Grad-CAM++">Grad-CAM++</option>
            <option value="SHAP">SHAP</option>
            <option value="Integrated Gradients">Integrated Gradients</option>
            <option value="Attention Rollout">Attention Rollout</option>
            <option value="Fused">Fused Unified Explanation</option>
          </select>
        </div>
      </div>

      {/* Multi-Panel Visual Comparison: Original -> Perturbed -> Difference */}
      {result && (
        <div className="bg-white rounded-xl border border-clinical-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-clinical-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-clinical-800">
              Perturbation Saliency Degradation Flow
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-clinical-500">Perturbation Stability Score:</span>
              <span
                className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                  result.perturbation_stability_score >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : result.perturbation_stability_score >= 60
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {result.perturbation_stability_score.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Panel 1: Original */}
            <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 flex flex-col items-center space-y-2">
              <span className="text-[11px] font-bold text-clinical-700 uppercase">
                1. Original Input Baseline
              </span>
              <div className="w-[200px] h-[200px] rounded-lg overflow-hidden border border-slate-700 bg-black relative shadow-inner">
                <img
                  src={currentCase.image_base64}
                  alt="Original"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <div className="text-[11px] text-clinical-600 font-mono text-center">
                Conf: {(result.original_confidence * 100).toFixed(1)}% • XQI: {result.original_xqi.toFixed(1)}
              </div>
            </div>

            {/* Panel 2: Perturbed Input & Heatmap */}
            <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 flex flex-col items-center space-y-2">
              <span className="text-[11px] font-bold text-clinical-700 uppercase">
                2. Perturbed Saliency ({result.perturbation_type})
              </span>
              <div className="w-[200px] h-[200px] rounded-lg overflow-hidden border border-slate-700 bg-black relative shadow-inner">
                <img
                  src={currentCase.image_base64}
                  alt="Original"
                  style={{
                    filter:
                      perturbationType === 'blur'
                        ? `blur(${intensity * 4}px)`
                        : perturbationType === 'contrast'
                        ? `contrast(${1 + intensity})`
                        : perturbationType === 'brightness'
                        ? `brightness(${1 + intensity * 0.5})`
                        : 'none',
                    transform:
                      perturbationType === 'rotation'
                        ? `rotate(${intensity * 10}deg)`
                        : 'none',
                  }}
                  className="w-full h-full object-contain pointer-events-none absolute inset-0 opacity-80"
                />
                <canvas
                  ref={canvasPerturbedRef}
                  className="w-full h-full object-contain pointer-events-none absolute inset-0"
                />
              </div>
              <div className="text-[11px] text-clinical-600 font-mono text-center">
                Conf: {(result.perturbed_confidence * 100).toFixed(1)}% • XQI: {result.perturbed_xqi.toFixed(1)}
              </div>
            </div>

            {/* Panel 3: Difference Map */}
            <div className="p-3 rounded-lg bg-clinical-50 border border-clinical-200 flex flex-col items-center space-y-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase">
                3. Spatial Difference / Saliency Drift
              </span>
              <div className="w-[200px] h-[200px] rounded-lg overflow-hidden border border-slate-700 bg-slate-950 relative shadow-inner">
                <canvas
                  ref={canvasDiffRef}
                  className="w-full h-full object-contain pointer-events-none"
                />
                <div className="absolute bottom-1 right-1 text-[9px] font-mono text-rose-400 bg-black/60 px-1 rounded">
                  Δ Absolute Drift
                </div>
              </div>
              <div className="text-[11px] text-clinical-600 font-mono text-center">
                Similarity Index: {(result.explanation_similarity * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Research Interpretation Callout */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600 block">
              Stability Analysis Finding
            </span>
            <p className="mt-0.5 leading-relaxed">
              {result.interpretation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
