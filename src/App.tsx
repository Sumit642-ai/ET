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
  onRoleChange: (role: 'analyst' | 'police') => void;
}

const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '/api'
  : 'http://localhost:5000/api';

const MainApplication: React.FC<MainAppProps> = ({ userRole, onRoleChange }) => {
  const [cases, setCases] = useState<FraudCase[]>(INITIAL_CASES);
  const [serverRings, setServerRings] = useState<FraudRing[]>([]);
  const [serverLinks, setServerLinks] = useState<EvidenceLink[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('map');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedRing, setSelectedRing] = useState<FraudRing | null>(null);
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [activeReport, setActiveReport] = useState<CaseReport | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    severity: 'all',
    status: 'all',
    linkageType: 'all',
    searchQuery: '',
    selectedCity: 'all'
  });

  // Fetch Cases and Rings from Backend API
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
      console.warn('[ChakraView Frontend] Backend API offline. Using high-density fallback seed dataset.', err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const fallbackEngine = useMemo(() => {
    return detectFraudRings(cases, 0.30);
  }, [cases]);

  const activeRings = serverRings.length > 0 ? serverRings : fallbackEngine.rings;
  const activeLinks = serverLinks.length > 0 ? serverLinks : fallbackEngine.links;

  // Role-Based Access Control (RBAC): Analyst gets 30% institution scope, Police Admin gets 100%
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

  // Apply End-to-End Filter Options (Severity, Status, Linkage Type, City, Search)
  const filteredCases = useMemo(() => {
    return rbacCases.filter(c => {
      // 1. Severity Filter
      if (filters.severity === 'critical' && c.risk_score < 90) return false;
      if (filters.severity === 'high' && (c.risk_score < 75 || c.risk_score >= 90)) return false;
      if (filters.severity === 'medium' && (c.risk_score < 50 || c.risk_score >= 75)) return false;
      if (filters.severity === 'low' && c.risk_score >= 50) return false;

      // 2. City Filter
      if (filters.selectedCity !== 'all' && c.city !== filters.selectedCity) return false;

      // 3. Status Filter (active vs resolved vs in_progress)
      if (filters.status === 'active' && c.risk_score < 70) return false;
      if (filters.status === 'in_progress' && (c.risk_score < 50 || c.risk_score >= 70)) return false;
      if (filters.status === 'resolved' && c.risk_score >= 50) return false;

      // 4. Linkage Type Filter
      if (filters.linkageType === 'script-only-linked' && !c.transcript_text.toLowerCase().includes('cbi')) return false;
      if (filters.linkageType === 'hard-identifier-linked' && c.transcript_text.toLowerCase().includes('cbi')) return false;

      // 5. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchVictim = (c.victim_name || c.internal_customer_id || '').toLowerCase().includes(q);
        const matchUpi = (c.upi_vpa || '').toLowerCase().includes(q);
        const matchDevice = (c.device_id || '').toLowerCase().includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchTranscript = (c.transcript_text || '').toLowerCase().includes(q);
        if (!matchVictim && !matchUpi && !matchDevice && !matchCity && !matchTranscript) return false;
      }

      return true;
    });
  }, [rbacCases, filters]);

  const filteredRings = useMemo(() => {
    return rbacRings.filter(r => {
      if (filters.linkageType !== 'all' && r.evidence_type !== filters.linkageType) return false;
      return true;
    });
  }, [rbacRings, filters]);

  const totalAmountAtRisk = useMemo(() => {
    return filteredRings.reduce((acc, r) => acc + r.total_amount_at_risk, 0);
  }, [filteredRings]);

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
    <div className="min-h-screen bg-[#0B101E] text-white flex flex-col font-sans selection:bg-rose-600 selection:text-white pb-16 transition-colors">
      {/* Top Header Navigation */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeRingCount={filteredRings.length}
        totalAtRisk={totalAmountAtRisk}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'bn' ? 'en' : 'bn')}
        userRole={userRole}
        onRoleChange={onRoleChange}
      />

      {/* RBAC Role Indicator Banner */}
      <div className="bg-[#1A2235] text-white text-xs px-6 py-2 flex items-center justify-between border-b border-slate-800 font-mono">
        <span className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${userRole === 'analyst' ? 'bg-amber-400 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/50'} shadow-sm`} />
          CURRENT ROLE SCOPE: <strong className="uppercase text-rose-400">{userRole === 'analyst' ? 'Bank Analyst (30% Scope)' : 'Police Admin (100% Full Scope)'}</strong>
          <span className="text-slate-400 text-[11px]">({filteredCases.length} Active Complaints Filtered)</span>
        </span>
        <a href="/login" className="text-slate-400 hover:text-white underline font-bold">Switch Role / Logout</a>
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
            rings={filteredRings}
            onSelectRing={setSelectedRing}
            onSelectCase={setSelectedCase}
            onOpenIntake={() => setIsIntakeOpen(true)}
            activeRingCount={filteredRings.length}
            totalAmountAtRisk={totalAmountAtRisk}
          />
        )}

        {currentView === 'graph' && (
          <NetworkGraphView
            cases={filteredCases}
            links={activeLinks}
            rings={filteredRings}
            onSelectCase={setSelectedCase}
            onSelectRing={setSelectedRing}
          />
        )}

        {currentView === 'list' && (
          <ListView
            cases={filteredCases}
            rings={filteredRings}
            onSelectCase={setSelectedCase}
            onSelectRing={setSelectedRing}
            onOpenReport={setActiveReport}
          />
        )}

        {currentView === 'reports' && (
          <DashboardView
            cases={filteredCases}
            rings={filteredRings}
            onSelectRing={setSelectedRing}
          />
        )}
      </main>

      {/* Sticky Bottom Action Navigation Bar */}
      <BottomNav
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeRingCount={filteredRings.length}
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
    return (localStorage.getItem('chakraview_user_role') as any) || 'analyst';
  });

  const handleRoleChange = (role: 'analyst' | 'police') => {
    setUserRole(role);
    localStorage.setItem('chakraview_user_role', role);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen onLogin={handleRoleChange} />} />
        <Route path="/" element={<MainApplication userRole={userRole} onRoleChange={handleRoleChange} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
