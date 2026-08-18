import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Sparkles, ExternalLink, Printer } from 'lucide-react';
import { CaseAnalysis } from '../../types';
import { fetchReportMarkdown, fetchReportJSON } from '../../lib/api';

interface ReportsViewProps {
  currentCase: CaseAnalysis;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentCase }) => {
  const [markdown, setMarkdown] = useState<string>('');
  const [jsonStr, setJsonStr] = useState<string>('');
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchReportMarkdown(currentCase.case_id).then(setMarkdown).catch(console.error);
    fetchReportJSON(currentCase.case_id).then(setJsonStr).catch(console.error);
  }, [currentCase.case_id]);

  const handleCopy = () => {
    const text = activeFormat === 'markdown' ? markdown : jsonStr;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Case_ID,Modality,Dataset,Model,Predicted_Label,Probability,Uncertainty_Score,Uncertainty_Level,XQI_Score,Reliability_Score,Reliability_Level,Overall_Agreement',
        `"${currentCase.case_id}","${currentCase.modality}","${currentCase.dataset}","${currentCase.model_name}","${currentCase.prediction.label}",${(currentCase.prediction.probability * 100).toFixed(1)}%,${currentCase.uncertainty.score},"${currentCase.uncertainty.level}",${currentCase.xqi.overall},${currentCase.reliability.score},"${currentCase.reliability.level}",${currentCase.fusion.overall_agreement}%`
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `case_report_${currentCase.case_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Audit & Provenance Dossier
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
            Research Evaluation Reports
          </h1>
          <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
            Export complete provenance-backed audit dossiers for academic publications, clinical case audits,
            and reproducibility benchmarking.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-clinical-100 hover:bg-clinical-200 text-clinical-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-clinical-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Dossier'}</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 rounded-lg bg-clinical-900 hover:bg-black text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Summary CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Format Toggle & Report Viewer */}
      <div className="bg-white rounded-xl border border-clinical-200 shadow-sm overflow-hidden space-y-0">
        <div className="px-5 py-3 border-b border-clinical-200 bg-clinical-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <button
              onClick={() => setActiveFormat('markdown')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeFormat === 'markdown' ? 'bg-white text-clinical-900 shadow-2xs border border-clinical-200' : 'text-clinical-600'
              }`}
            >
              Academic Markdown Report
            </button>
            <button
              onClick={() => setActiveFormat('json')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeFormat === 'json' ? 'bg-white text-clinical-900 shadow-2xs border border-clinical-200' : 'text-clinical-600'
              }`}
            >
              Full JSON Schema Audit
            </button>
          </div>
          <span className="text-[11px] font-mono text-clinical-500 font-medium">
            Case: {currentCase.case_id}
          </span>
        </div>

        <div className="p-6 overflow-x-auto max-h-[700px] overflow-y-auto">
          {activeFormat === 'markdown' ? (
            <pre className="font-mono text-xs text-clinical-800 whitespace-pre-wrap leading-relaxed">
              {markdown}
            </pre>
          ) : (
            <pre className="font-mono text-xs text-blue-900 bg-slate-50 p-4 rounded-lg overflow-x-auto">
              {jsonStr}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
