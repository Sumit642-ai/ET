import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { FraudCase, FraudRing, ViewMode, FilterState, CaseReport } from './types/fraud';
import { INITIAL_CASES } from './data/seedData';
import { detectFraudRings } from './services/evidenceEngine';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { NammakasaMapView } from './components/NammakasaMapView';
import { NetworkGraphView } from './components/NetworkGraphView';
import { ListView } from './components/ListView';
import { CaseIntakeModal } from './components/CaseIntakeModal';
import { RingDetailDrawer } from './components/RingDetailDrawer';
import { CaseReportModal } from './components/CaseReportModal';
import { BottomNav } from './components/BottomNav';

export const App: React.FC = () => {
  const [cases, setCases] = useState<FraudCase[]>(INITIAL_CASES);
  const [currentView, setCurrentView] = useState<ViewMode>('map');
  const [language, setLanguage] = useState<'en' | 'bn'>('bn');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedRing, setSelectedRing] = useState<FraudRing | null>(null);
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [activeReport, setActiveReport] = useState<CaseReport | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    severity: 'all',
    status: 'all',
    linkageType: 'all',
    searchQuery: '',
    selectedCity: 'all'
  });

  // Calculate dynamic links & rings using multi-signal fusion engine
  const { links, rings } = useMemo(() => {
    return detectFraudRings(cases, 0.30);
  }, [cases]);

  // Apply filters
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (filters.severity === 'critical' && c.risk_score < 90) return false;
      if (filters.severity === 'high' && (c.risk_score < 75 || c.risk_score >= 90)) return false;
      if (filters.severity === 'medium' && (c.risk_score < 50 || c.risk_score >= 75)) return false;
      if (filters.severity === 'low' && c.risk_score >= 50) return false;

      if (filters.selectedCity !== 'all' && c.city !== filters.selectedCity) return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchVictim = c.victim_name?.toLowerCase().includes(q);
        const matchUpi = c.upi_vpa?.toLowerCase().includes(q);
        const matchDevice = c.device_id?.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchTranscript = c.transcript_text.toLowerCase().includes(q);
        if (!matchVictim && !matchUpi && !matchDevice && !matchCity && !matchTranscript) return false;
      }

      return true;
    });
  }, [cases, filters]);

  const totalAmountAtRisk = useMemo(() => {
    return rings.reduce((acc, r) => acc + r.total_amount_at_risk, 0);
  }, [rings]);

  // Dynamic Total Reports Counter (matches 6893 + newly added cases)
  const totalReportCount = useMemo(() => {
    return 6893 + (cases.length - INITIAL_CASES.length);
  }, [cases]);

  // Real-time Complaint Ingestion Handler
  const handleIngestNewCase = (newCase: FraudCase) => {
    setCases(prev => [newCase, ...prev]);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    setCurrentView('graph');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-16">
      {/* Top Header Navigation (Exact NammaKasa 1:1) */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeRingCount={rings.length}
        totalAtRisk={totalAmountAtRisk}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'bn' ? 'en' : 'bn')}
      />

      {/* Filter Controls Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
        onReset={() => setFilters({
          severity: 'all',
          status: 'all',
          linkageType: 'all',
          searchQuery: '',
          selectedCity: 'all'
        })}
        totalCases={cases.length}
        filteredCount={filteredCases.length}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content Workspace View */}
      <main className="flex-1 relative w-full overflow-hidden">
        {currentView === 'map' && (
          <NammakasaMapView
            cases={filteredCases}
            rings={rings}
            onSelectRing={setSelectedRing}
            onSelectCase={setSelectedCase}
            onOpenIntake={() => setIsIntakeOpen(true)}
            activeRingCount={rings.length}
            totalAmountAtRisk={totalAmountAtRisk}
          />
        )}

        {currentView === 'graph' && (
          <NetworkGraphView
            cases={filteredCases}
            links={links}
            rings={rings}
            onSelectCase={setSelectedCase}
            onSelectRing={setSelectedRing}
          />
        )}

        {(currentView === 'list' || currentView === 'reports') && (
          <ListView
            cases={filteredCases}
            rings={rings}
            onSelectCase={setSelectedCase}
            onSelectRing={setSelectedRing}
          />
        )}
      </main>

      {/* Sticky Bottom Action Navigation Bar (NammaKasa Style) */}
      <BottomNav
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeRingCount={rings.length}
        totalAtRisk={totalAmountAtRisk}
        totalReportCount={totalReportCount}
      />

      {/* Complaint Intake & Scan QR Modal */}
      <CaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSubmitCase={handleIngestNewCase}
      />

      {/* Ring Intelligence Drawer */}
      <RingDetailDrawer
        ring={selectedRing}
        cases={cases}
        onClose={() => setSelectedRing(null)}
        onOpenReport={setActiveReport}
      />

      {/* Case Intelligence Report Modal */}
      <CaseReportModal
        report={activeReport}
        onClose={() => setActiveReport(null)}
      />
    </div>
  );
};
export default App;
