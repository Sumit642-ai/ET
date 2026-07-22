import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FraudCase, FraudRing, ViewMode, FilterState, CaseReport, EvidenceLink } from './types/fraud';
import { INITIAL_CASES } from './data/seedData';
import { detectFraudRings } from './services/evidenceEngine';

import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { NammakasaMapView } from './components/NammakasaMapView';
import { NetworkGraphView } from './components/NetworkGraphView';
import { ListView } from './components/ListView';
import { DashboardView } from './components/DashboardView';
import { CaseIntakeModal } from './components/CaseIntakeModal';
import { RingDetailDrawer } from './components/RingDetailDrawer';
import { CaseReportModal } from './components/CaseReportModal';
import { BottomNav } from './components/BottomNav';

interface MainAppProps {
  userRole: 'analyst' | 'police';
}

const API_BASE = 'http://localhost:5000/api';

const MainApplication: React.FC<MainAppProps> = ({ userRole }) => {
  const [cases, setCases] = useState<FraudCase[]>(INITIAL_CASES);
  const [serverRings, setServerRings] = useState<FraudRing[]>([]);
  const [serverLinks, setServerLinks] = useState<EvidenceLink[]>([]);
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

  // Fetch Cases and Rings from Express Backend Server (http://localhost:5000/api)
  const fetchBackendData = async () => {
    try {
      const resCases = await fetch(`${API_BASE}/cases`);
      const dataCases = await resCases.json();
      if (dataCases.success && dataCases.cases.length > 0) {
        setCases(dataCases.cases);
      }

      const resRings = await fetch(`${API_BASE}/rings`);
      const dataRings = await resRings.json();
      if (dataRings.success) {
        setServerRings(dataRings.rings);
        setServerLinks(dataRings.links);
      }
    } catch (err) {
      console.warn('[Chakravyuh Frontend] Backend API offline. Using high-density fallback seed dataset.', err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Calculate dynamic links & rings if server response pending
  const fallbackEngine = useMemo(() => {
    return detectFraudRings(cases, 0.30);
  }, [cases]);

  const activeRings = serverRings.length > 0 ? serverRings : fallbackEngine.rings;
  const activeLinks = serverLinks.length > 0 ? serverLinks : fallbackEngine.links;

  // Role-Based Access Control (RBAC): Analyst gets 30% view scope, Police Admin gets 100%
  const rbacCases = useMemo(() => {
    if (userRole === 'analyst') {
      const sliceCount = Math.max(5, Math.ceil(cases.length * 0.30));
      return cases.slice(0, sliceCount);
    }
    return cases;
  }, [cases, userRole]);

  const rbacRings = useMemo(() => {
    if (userRole === 'analyst') {
      const sliceCount = Math.max(1, Math.ceil(activeRings.length * 0.30));
      return activeRings.slice(0, sliceCount);
    }
    return activeRings;
  }, [activeRings, userRole]);

  // Apply UI Filters
  const filteredCases = useMemo(() => {
    return rbacCases.filter(c => {
      if (filters.severity === 'critical' && c.risk_score < 90) return false;
      if (filters.severity === 'high' && (c.risk_score < 75 || c.risk_score >= 90)) return false;
      if (filters.severity === 'medium' && (c.risk_score < 50 || c.risk_score >= 75)) return false;
      if (filters.severity === 'low' && c.risk_score >= 50) return false;

      if (filters.selectedCity !== 'all' && c.city !== filters.selectedCity) return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchVictim = c.victim_name?.toLowerCase().includes(q) || c.internal_customer_id?.toLowerCase().includes(q);
        const matchUpi = c.upi_vpa?.toLowerCase().includes(q);
        const matchDevice = c.device_id?.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchTranscript = c.transcript_text.toLowerCase().includes(q);
        if (!matchVictim && !matchUpi && !matchDevice && !matchCity && !matchTranscript) return false;
      }

      return true;
    });
  }, [rbacCases, filters]);

  const totalAmountAtRisk = useMemo(() => {
    return rbacRings.reduce((acc, r) => acc + r.total_amount_at_risk, 0);
  }, [rbacRings]);

  // Dynamic Total Reports Counter (matches 6893 + newly added cases)
  const totalReportCount = useMemo(() => {
    return 6893 + (cases.length - INITIAL_CASES.length);
  }, [cases]);

  // Live Complaint Ingestion Handler (POST to Express Backend API)
  const handleIngestNewCase = async (newCase: FraudCase) => {
    try {
      const response = await fetch(`${API_BASE}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      });
      const data = await response.json();
      if (data.success) {
        setCases(prev => [data.case, ...prev]);
        setServerRings(data.rings);
        setServerLinks(data.links);
      } else {
        setCases(prev => [newCase, ...prev]);
      }
    } catch {
      setCases(prev => [newCase, ...prev]);
    }

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    setCurrentView('graph');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-16">
      {/* Top Header Navigation */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeRingCount={rbacRings.length}
        totalAtRisk={totalAmountAtRisk}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'bn' ? 'en' : 'bn')}
      />

      {/* RBAC Role Indicator Banner */}
      <div className="bg-slate-900 text-white text-xs px-6 py-1.5 flex items-center justify-between border-b border-slate-800 font-mono">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${userRole === 'analyst' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          LOGGED IN ROLE: <strong className="uppercase text-rose-400">{userRole === 'analyst' ? 'Bank Analyst (30% Scope)' : 'Police Admin (100% Scope)'}</strong>
        </span>
        <a href="/login" className="text-slate-400 hover:text-white underline">Switch Role / Logout</a>
      </div>

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
        totalCases={rbacCases.length}
        filteredCount={filteredCases.length}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content Workspace View */}
      <main className="flex-1 relative w-full overflow-hidden">
        {currentView === 'map' && (
          <NammakasaMapView
            cases={filteredCases}
            rings={rbacRings}
            onSelectRing={setSelectedRing}
            onSelectCase={setSelectedCase}
            onOpenIntake={() => setIsIntakeOpen(true)}
            activeRingCount={rbacRings.length}
            totalAmountAtRisk={totalAmountAtRisk}
          />
        )}

        {currentView === 'graph' && (
          <NetworkGraphView
            cases={filteredCases}
            links={activeLinks}
            rings={rbacRings}
            onSelectCase={setSelectedCase}
            onSelectRing={setSelectedRing}
          />
        )}

        {currentView === 'list' && (
          <ListView
            cases={filteredCases}
            rings={rbacRings}
            onSelectCase={setSelectedCase}
            onSelectRing={setSelectedRing}
          />
        )}

        {currentView === 'reports' && (
          <DashboardView
            cases={filteredCases}
            rings={rbacRings}
            onSelectRing={setSelectedRing}
          />
        )}
      </main>

      {/* Sticky Bottom Action Navigation Bar */}
      <BottomNav
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeRingCount={rbacRings.length}
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

export const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'analyst' | 'police'>(() => {
    return (localStorage.getItem('chakravyuh_user_role') as any) || 'analyst';
  });

  const handleLogin = (role: 'analyst' | 'police') => {
    setUserRole(role);
    localStorage.setItem('chakravyuh_user_role', role);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
        <Route path="/" element={<MainApplication userRole={userRole} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
