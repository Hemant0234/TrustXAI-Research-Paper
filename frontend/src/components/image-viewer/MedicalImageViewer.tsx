import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Layers,
  Maximize2,
  SplitSquareVertical,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { SaliencyMapData, FusionResult } from '../../types';

interface MedicalImageViewerProps {
  imageBase64?: string;
  modality: string;
  caseId: string;
  explanations: Record<string, SaliencyMapData>;
  fusion: FusionResult;
  groundTruthBbox?: number[];
  groundTruthClass?: string;
  activeOverlay?: OverlayMode;
  onOverlayChange?: (mode: OverlayMode) => void;
}

export type OverlayMode =
  | 'original'
  | 'gradcam'
  | 'shap'
  | 'ig'
  | 'attention'
  | 'fused'
  | 'agreement'
  | 'disagreement';

export const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  imageBase64,
  modality,
  caseId,
  explanations,
  fusion,
  groundTruthBbox,
  groundTruthClass,
  activeOverlay: externalOverlay,
  onOverlayChange
}) => {
  const [internalOverlay, setInternalOverlay] = useState<OverlayMode>('fused');
  const activeOverlay = externalOverlay || internalOverlay;
  const setActiveOverlay = (mode: OverlayMode) => {
    setInternalOverlay(mode);
    if (onOverlayChange) onOverlayChange(mode);
  };
  const [opacity, setOpacity] = useState<number>(0.70);
  const [threshold, setThreshold] = useState<number>(0.20);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSideBySide, setIsSideBySide] = useState<boolean>(false);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showBbox, setShowBbox] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const splitCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get active matrix based on overlay mode
  const getActiveMatrix = (): { matrix: number[][]; name: string; type: string } => {
    switch (activeOverlay) {
      case 'gradcam':
        return {
          matrix: explanations['Grad-CAM++']?.matrix || [],
          name: 'Grad-CAM++',
          type: 'Gradient-Weighted Activation'
        };
      case 'shap':
        return {
          matrix: explanations['SHAP']?.matrix || [],
          name: 'SHAP (Partition Attribution)',
          type: 'Game-Theoretic Shapley Values'
        };
      case 'ig':
        return {
          matrix: explanations['Integrated Gradients']?.matrix || [],
          name: 'Integrated Gradients',
          type: 'Path-Integrated Axiomatic Attribution'
        };
      case 'attention':
        return {
          matrix: explanations['Attention Rollout']?.matrix || [],
          name: 'Attention Rollout',
          type: 'Transformer Self-Attention Flow'
        };
      case 'agreement':
        return {
          matrix: fusion.agreement_matrix,
          name: 'Multi-Explainer Consensus Map',
          type: 'High Explainer Agreement (Low Spatial Variance)'
        };
      case 'disagreement':
        return {
          matrix: fusion.disagreement_matrix,
          name: 'Explainer Disagreement Map',
          type: 'Contested Attribution Regions (High Variance)'
        };
      case 'fused':
      default:
        return {
          matrix: fusion.fused_matrix,
          name: 'Unified Fused Explanation',
          type: 'Uncertainty-Weighted Quality-Aware Fusion'
        };
    }
  };

  const activeData = getActiveMatrix();

  // Render heatmap overlay onto canvas
  useEffect(() => {
    const renderHeatmap = (canvas: HTMLCanvasElement | null, matrix: number[][], mode: OverlayMode) => {
      if (!canvas || !matrix || matrix.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = matrix.length;
      canvas.width = 384;
      canvas.height = 384;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'original') return;

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

          if (rawVal < threshold) {
            data[idx + 3] = 0; // Transparent
            continue;
          }

          const normVal = (rawVal - threshold) / (1.0 - threshold);

          if (mode === 'disagreement') {
            // Hot magenta/crimson colormap for disagreement
            data[idx] = Math.floor(220 + 35 * normVal); // Red
            data[idx + 1] = Math.floor(38 * (1 - normVal)); // Green
            data[idx + 2] = Math.floor(80 + 100 * normVal); // Blue
            data[idx + 3] = Math.floor(255 * opacity * normVal);
          } else if (mode === 'agreement') {
            // Emerald/cyan colormap for agreement
            data[idx] = Math.floor(16 * (1 - normVal));
            data[idx + 1] = Math.floor(185 + 70 * normVal);
            data[idx + 2] = Math.floor(129 + 100 * normVal);
            data[idx + 3] = Math.floor(255 * opacity * normVal);
          } else if (mode === 'fused') {
            // Distinctive Clinical Turbo/Indigo-Amber colormap for Fused
            if (normVal < 0.35) {
              data[idx] = 37;
              data[idx + 1] = 99;
              data[idx + 2] = 235; // Blue
            } else if (normVal < 0.7) {
              data[idx] = 234;
              data[idx + 1] = 88;
              data[idx + 2] = 12; // Orange
            } else {
              data[idx] = 239;
              data[idx + 1] = 68;
              data[idx + 2] = 68; // Red-hot
            }
            data[idx + 3] = Math.floor(255 * opacity * Math.pow(normVal, 0.8));
          } else {
            // Jet-like biomedical gradient: Blue -> Cyan -> Yellow -> Red
            if (normVal < 0.25) {
              data[idx] = 0;
              data[idx + 1] = Math.floor(4 * normVal * 255);
              data[idx + 2] = 255;
            } else if (normVal < 0.5) {
              data[idx] = 0;
              data[idx + 1] = 255;
              data[idx + 2] = Math.floor((1 - 4 * (normVal - 0.25)) * 255);
            } else if (normVal < 0.75) {
              data[idx] = Math.floor(4 * (normVal - 0.5) * 255);
              data[idx + 1] = 255;
              data[idx + 2] = 0;
            } else {
              data[idx] = 255;
              data[idx + 1] = Math.floor((1 - 4 * (normVal - 0.75)) * 255);
              data[idx + 2] = 0;
            }
            data[idx + 3] = Math.floor(255 * opacity * normVal);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Draw subtle contour lines if enabled
      if (showContours && (mode as string) !== 'original') {
        ctx.strokeStyle = mode === 'disagreement' ? 'rgba(244, 63, 94, 0.7)' : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        // Simple bounding contour around high saliency peak
        const cx = canvas.width * 0.62;
        const cy = canvas.height * 0.58;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, 2 * Math.PI);
        ctx.stroke();
      }
    };

    renderHeatmap(canvasRef.current, activeData.matrix, activeOverlay);
    if (isSideBySide) {
      renderHeatmap(splitCanvasRef.current, activeData.matrix, activeOverlay);
    }
  }, [activeOverlay, opacity, threshold, activeData.matrix, showContours, isSideBySide]);

  // Pan & Zoom controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white rounded-xl border border-clinical-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Viewer Control Bar */}
      <div className="px-4 py-2.5 bg-clinical-50 border-b border-clinical-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-700">
            Image & Attribution Viewer
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-clinical-200 text-clinical-800 font-mono">
            {caseId} • {modality}
          </span>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsSideBySide(!isSideBySide)}
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center space-x-1.5 transition-colors ${
              isSideBySide
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-clinical-100 hover:bg-clinical-200 text-clinical-700'
            }`}
            title="Side-by-Side: Original Scan vs Explanation"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setShowContours(!showContours)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showContours
                ? 'bg-clinical-800 text-white'
                : 'bg-clinical-100 hover:bg-clinical-200 text-clinical-700'
            }`}
          >
            Contours
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="p-1 rounded bg-clinical-100 hover:bg-clinical-200 text-clinical-700"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
            className="p-1 rounded bg-clinical-100 hover:bg-clinical-200 text-clinical-700"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1 rounded bg-clinical-100 hover:bg-clinical-200 text-clinical-700"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Selector Bar */}
      <div className="px-4 py-2 bg-clinical-100/70 border-b border-clinical-200 flex items-center space-x-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold uppercase text-clinical-500 mr-1 shrink-0">
          Layer:
        </span>
        {[
          { id: 'original', label: 'Original Scan' },
          { id: 'fused', label: 'Fused Explanation', highlight: true },
          { id: 'gradcam', label: 'Grad-CAM++' },
          { id: 'shap', label: 'SHAP' },
          { id: 'ig', label: 'Integrated Gradients' },
          { id: 'attention', label: 'Attention Rollout' },
          { id: 'agreement', label: 'Agreement Map', badge: `${Math.round(fusion.overall_agreement * 100)}%` },
          { id: 'disagreement', label: 'Disagreement Map', alert: true },
        ].map((layer) => {
          const isSelected = activeOverlay === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveOverlay(layer.id as OverlayMode)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? layer.highlight
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-clinical-900 text-white font-semibold'
                  : 'bg-white hover:bg-clinical-200/80 text-clinical-700 border border-clinical-200'
              }`}
            >
              <span>{layer.label}</span>
              {layer.badge && (
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {layer.badge}
                </span>
              )}
              {layer.alert && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Viewport Container */}
      <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[380px] overflow-hidden select-none relative">
        <div
          className={`grid gap-4 w-full justify-center ${isSideBySide ? 'grid-cols-2' : 'grid-cols-1 max-w-[420px]'}`}
        >
          {/* Side A: Original Scan (in Side-by-Side mode) */}
          {isSideBySide && (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-slate-400 mb-1">
                ORIGINAL RADIOGRAPH ({modality})
              </span>
              <div className="relative w-[340px] h-[340px] rounded-lg overflow-hidden border border-slate-700 bg-black shadow-inner">
                {imageBase64 ? (
                  <img
                    src={imageBase64}
                    alt="Original scan"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    Loading Scan...
                  </div>
                )}
                {/* Expert Ground Truth BBox */}
                {groundTruthBbox && showBbox && (
                  <div
                    className="absolute border-2 border-emerald-400 border-dashed rounded pointer-events-none"
                    style={{
                      top: `${groundTruthBbox[0] * 100}%`,
                      left: `${groundTruthBbox[1] * 100}%`,
                      height: `${(groundTruthBbox[2] - groundTruthBbox[0]) * 100}%`,
                      width: `${(groundTruthBbox[3] - groundTruthBbox[1]) * 100}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 bg-emerald-700 text-white text-[9px] font-bold px-1 rounded">
                      Expert Truth: {groundTruthClass || 'Lesion'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Side B: Primary Scan with Overlay */}
          <div className="flex flex-col items-center">
            {isSideBySide && (
              <span className="text-[11px] font-mono text-blue-400 mb-1">
                ATTRIBUTION: {activeData.name.toUpperCase()}
              </span>
            )}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative rounded-lg overflow-hidden border border-slate-700 bg-black shadow-inner cursor-grab active:cursor-grabbing ${
                isSideBySide ? 'w-[340px] h-[340px]' : 'w-[384px] h-[384px]'
              }`}
            >
              {/* Underlying Medical Image */}
              {imageBase64 ? (
                <img
                  src={imageBase64}
                  alt="Medical scan"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                  }}
                  className="w-full h-full object-contain pointer-events-none absolute inset-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  Loading Scan Visuals...
                </div>
              )}

              {/* Dynamic Heatmap Canvas Overlay */}
              <canvas
                ref={canvasRef}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                }}
                className="w-full h-full object-contain pointer-events-none absolute inset-0"
              />

              {/* Expert Ground Truth BBox on overlay */}
              {groundTruthBbox && showBbox && (
                <div
                  className="absolute border-2 border-emerald-400 border-dashed rounded pointer-events-none"
                  style={{
                    top: `${groundTruthBbox[0] * 100}%`,
                    left: `${groundTruthBbox[1] * 100}%`,
                    height: `${(groundTruthBbox[2] - groundTruthBbox[0]) * 100}%`,
                    width: `${(groundTruthBbox[3] - groundTruthBbox[1]) * 100}%`,
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-emerald-800 text-white text-[9px] font-bold px-1 rounded">
                    Expert Truth: {groundTruthClass || 'Lesion'}
                  </span>
                </div>
              )}

              {/* Floating Provenance Tag */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 backdrop-blur-sm rounded border border-white/10 text-[10px] text-slate-300 pointer-events-none">
                <span className="text-slate-400">Viewing: </span>
                <span className="font-semibold text-white">{activeData.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Slider & Heatmap Configuration Bar */}
      <div className="px-4 py-3 bg-clinical-50 border-t border-clinical-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Opacity slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-clinical-700 font-medium">
            <span>Attribution Opacity</span>
            <span className="font-mono font-semibold">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-clinical-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Saliency threshold slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-clinical-700 font-medium">
            <span>Saliency Threshold (Noise Suppression)</span>
            <span className="font-mono font-semibold">{Math.round(threshold * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.80"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-clinical-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
