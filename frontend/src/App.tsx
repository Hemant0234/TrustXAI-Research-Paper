import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { AnalyzeCaseView } from './components/views/AnalyzeCaseView';
import { ExplanationLabView } from './components/views/ExplanationLabView';
import { ReliabilityView } from './components/views/ReliabilityView';
import { RobustnessView } from './components/views/RobustnessView';
import { ValidationView } from './components/views/ValidationView';
import { ExperimentsView } from './components/views/ExperimentsView';
import { ClinicalStudyView } from './components/views/ClinicalStudyView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { CaseAnalysis, CaseSummary } from './types';
import {
  fetchCases,
  fetchCaseDetail,
  recalculateCustomFusion,
  recalculateXQI
} from './lib/api';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavView>('analyze');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string>('TX-2048');
  const [currentCase, setCurrentCase] = useState<CaseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Load cases on mount
  useEffect(() => {
    fetchCases()
      .then((data) => {
        setCases(data);
        if (data.length > 0) {
          loadCase(currentCaseId);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch initial cases', err);
        setIsLoading(false);
      });
  }, []);

  const loadCase = async (caseId: string) => {
    setIsLoading(true);
    try {
      const detail = await fetchCaseDetail(caseId);
      setCurrentCase(detail);
      setCurrentCaseId(caseId);
    } catch (err) {
      console.error(`Failed to load case ${caseId}`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = (caseId: string) => {
    loadCase(caseId);
    setActiveView('analyze');
  };

  const handleRecalculateFusion = async (weights: Record<string, number>) => {
    if (!currentCase) return;
    try {
      const updatedFusion = await recalculateCustomFusion(currentCase.case_id, weights);
      setCurrentCase({
        ...currentCase,
        fusion: updatedFusion
      });
    } catch (err) {
      console.error('Failed to recalculate fusion', err);
    }
  };

  const handleRecalculateXQI = async (weights: Record<string, number>) => {
    if (!currentCase) return;
    try {
      const res = await recalculateXQI(currentCase.case_id, weights);
      setCurrentCase({
        ...currentCase,
        xqi: res.xqi,
        reliability: res.reliability
      });
    } catch (err) {
      console.error('Failed to recalculate XQI', err);
    }
  };

  const renderActiveView = () => {
    if (isLoading || !currentCase) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-clinical-600 font-mono">
              Loading TrustXAI-Med Research Pipeline...
            </p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'overview':
        return (
          <OverviewView
            cases={cases}
            onSelectCase={handleSelectCase}
            onNavigateToAnalyze={() => setActiveView('analyze')}
          />
        );
      case 'analyze':
        return (
          <AnalyzeCaseView
            currentCase={currentCase}
            allCaseSummaries={cases}
            onSelectCase={loadCase}
            onRecalculateFusion={handleRecalculateFusion}
            onRecalculateXQI={handleRecalculateXQI}
            onNavigateToReports={() => setActiveView('reports')}
          />
        );
      case 'fusion':
        return (
          <ExplanationLabView
            currentCase={currentCase}
            onRecalculateFusion={handleRecalculateFusion}
          />
        );
      case 'reliability':
        return (
          <ReliabilityView
            currentCase={currentCase}
            onRecalculateXQI={handleRecalculateXQI}
          />
        );
      case 'robustness':
        return <RobustnessView currentCase={currentCase} />;
      case 'validation':
        return <ValidationView />;
      case 'experiments':
        return <ExperimentsView />;
      case 'clinical-study':
        return <ClinicalStudyView currentCase={currentCase} />;
      case 'reports':
        return <ReportsView currentCase={currentCase} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <AnalyzeCaseView
            currentCase={currentCase}
            allCaseSummaries={cases}
            onSelectCase={loadCase}
            onRecalculateFusion={handleRecalculateFusion}
            onRecalculateXQI={handleRecalculateXQI}
            onNavigateToReports={() => setActiveView('reports')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-clinical-100 font-sans antialiased text-clinical-900">
      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          currentCaseId={currentCaseId}
          modality={currentCase?.modality}
          isDemoMode={isDemoMode}
          onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
          onRefresh={() => loadCase(currentCaseId)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-clinical-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>

        {/* Persistent Research Disclaimer Footer */}
        <footer className="bg-white border-t border-clinical-200 px-6 py-2.5 text-[11px] text-clinical-500 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-clinical-700">TrustXAI-Med v1.0</span>
            <span>•</span>
            <span>Uncertainty-Aware Hybrid XAI Research Platform</span>
          </div>
          <div className="text-slate-600 font-medium">
            Research prototype for evaluation purposes only. Not intended for direct clinical diagnosis or medical decision-making.
          </div>
        </footer>
      </div>
    </div>
  );
};
