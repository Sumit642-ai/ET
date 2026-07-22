import React, { useState } from 'react';
import { FraudCase, FraudRing, CaseReport } from '../types/fraud';
import { Shield, ChevronDown, ChevronUp, FileText, Download, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface ListViewProps {
  cases: FraudCase[];
  rings: FraudRing[];
  onSelectCase: (c: FraudCase) => void;
  onSelectRing: (r: FraudRing) => void;
  onOpenReport?: (report: CaseReport) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  cases,
  rings,
  onSelectCase,
  onSelectRing,
  onOpenReport
}) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'rings'>('complaints');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(cases[0]?.case_id || null);
  const [expandedRingId, setExpandedRingId] = useState<string | null>(rings[0]?.ring_id || null);
  const [frozenVpas, setFrozenVpas] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleExpandCase = (id: string) => {
    setExpandedCaseId(prev => prev === id ? null : id);
  };

  const toggleExpandRing = (id: string) => {
    setExpandedRingId(prev => prev === id ? null : id);
  };

  const handleFreezeVpa = (vpa: string, caseId: string) => {
    setFrozenVpas(prev => ({ ...prev, [caseId]: true }));
    setToastMessage(`✅ Emergency Debit Freeze issued for VPA: ${vpa}. Sent to NPCI & RBI clearinghouse.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleViewReport = (c: FraudCase) => {
    if (onOpenReport) {
      const generatedReport: CaseReport = {
        report_id: `REP-${c.case_id}`,
        generated_at: new Date().toISOString(),
        ring_id: `RING-CASE-${c.case_id}`,
        ring_name: `Incident Report for ${c.case_id}`,
        total_amount_at_risk: c.amount,
        customers_affected: 1,
        summary_text: `Official ChakraView Law Enforcement Subpoena Report for Case ${c.case_id}. Scam type: ${c.scam_type}. VPA: ${c.upi_vpa}. Ingress Device: ${c.device_id}. Transcript: ${c.transcript_text}`,
        freeze_table: [
          {
            entity: c.upi_vpa,
            type: 'UPI VPA',
            risk_level: 'CRITICAL',
            rationale: 'Primary mule account identified in complaint',
            suggested_action: 'EMERGENCY_DEBIT_FREEZE'
          },
          {
            entity: c.scammer_account_number || 'ACCT-MULE-9901',
            type: 'Bank AC',
            risk_level: 'HIGH',
            rationale: 'Destination Bank AC for funds siphon',
            suggested_action: 'HOLD_CREDITS'
          }
        ],
        escalation_note: 'Immediate Cyber Cell freeze order issued under Section 91 CrPC and DPDP PII compliance guidelines.'
      };
      onOpenReport(generatedReport);
    }
  };

  const handleExportCSV = () => {
    const headers = "Case ID,Customer ID,UPI VPA,Amount,City,Risk Score,Transcript\n";
    const rows = cases.map(c => 
      `"${c.case_id}","${c.internal_customer_id || 'CUST-883921'}","${c.upi_vpa}",${c.amount},"${c.city}",${c.risk_score},"${c.transcript_text.replace(/"/g, '""')}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChakraView_Complaints_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-[#0B101E] text-white p-6 overflow-y-auto font-sans select-none transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="bg-emerald-950 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs font-mono shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Workspace Toolbar Header */}
        <div className="flex items-center justify-between bg-[#1A2235] p-4 rounded-2xl border border-slate-700/80 shadow-xs">
          <div className="flex items-center gap-2 p-1 bg-[#0B101E] rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'complaints'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Complaints List ({cases.length})
            </button>
            <button
              onClick={() => setActiveTab('rings')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'rings'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Detected Crime Rings ({rings.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>Export Complaints CSV</span>
          </button>
        </div>

        {/* Tab 1: Expandable Complaints List */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {cases.map((item) => {
              const isExpanded = expandedCaseId === item.case_id;
              const isFrozen = frozenVpas[item.case_id];
              const customerId = item.internal_customer_id || item.victim_name || `CUST-${Math.floor(100000 + Math.random() * 900000)}`;

              return (
                <div 
                  key={item.case_id}
                  className={`bg-[#1A2235] rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    isExpanded 
                      ? 'border-rose-500 ring-2 ring-rose-500/20' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Main Summary Header */}
                  <div 
                    onClick={() => toggleExpandCase(item.case_id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-rose-500 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-900">
                        {item.case_id}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm">
                            {customerId} • {item.city}
                          </h4>
                          {isFrozen && (
                            <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800">
                              DEBIT FROZEN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          VPA: <strong className="text-slate-200">{item.upi_vpa}</strong> | Device: {item.device_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amount at Risk</span>
                        <strong className="text-rose-500 font-mono text-sm font-bold">
                          ₹{(item.amount / 100000).toFixed(2)} Lakhs
                        </strong>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-300">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded 12-Field Complaint Detail Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 bg-[#0B101E]/60 space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Internal Customer ID</span>
                          <strong className="text-white font-bold">{customerId}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Scammer Bank Account</span>
                          <strong className="text-white font-bold">{item.scammer_account_number || 'ACCT-MULE-99001'}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Bank IFSC Code</span>
                          <strong className="text-white font-bold">{item.ifsc_code || 'UTIB0000123'}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Destination UPI VPA</span>
                          <strong className="text-rose-400 font-extrabold">{item.upi_vpa}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Scammer Phone Number</span>
                          <strong className="text-white font-bold">{item.scammer_phone_number || '+91 98301 22998'}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Ingress Device ID</span>
                          <strong className="text-white font-bold">{item.device_id}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">IP Address</span>
                          <strong className="text-white font-bold">{item.ip_address || '103.45.12.99'}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">Incident Timestamp</span>
                          <strong className="text-white font-bold">{new Date(item.timestamp).toLocaleString()}</strong>
                        </div>

                        <div className="bg-[#1A2235] p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase block">City / District / Pin Code</span>
                          <strong className="text-white font-bold">{item.city} • {item.pincode || '700017'}</strong>
                        </div>
                      </div>

                      {/* Unstructured Call Transcript Box */}
                      <div className="bg-[#1A2235] p-4 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px] uppercase font-mono block">Call Transcript / Victim Statement</span>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{item.transcript_text}"
                        </p>
                      </div>

                      {/* Working Action Buttons */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => handleFreezeVpa(item.upi_vpa, item.case_id)}
                          disabled={isFrozen}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                            isFrozen 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                              : 'bg-rose-600 hover:bg-rose-500 text-white'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isFrozen ? 'VPA Debit Frozen' : 'Emergency Freeze Mule VPA'}</span>
                        </button>

                        <button
                          onClick={() => handleViewReport(item)}
                          className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                          <span>View Report</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Expandable Crime Rings List */}
        {activeTab === 'rings' && (
          <div className="space-y-4">
            {rings.map((ring) => {
              const isExpanded = expandedRingId === ring.ring_id;

              return (
                <div
                  key={ring.ring_id}
                  className={`bg-[#1A2235] rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    isExpanded 
                      ? 'border-rose-500 ring-2 ring-rose-500/20' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => toggleExpandRing(ring.ring_id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-rose-500 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-900">
                        {ring.ring_id}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">
                          {ring.ring_name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ring.customers_affected} Victims across {ring.cities.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Funds at Risk</span>
                        <strong className="text-rose-500 font-mono text-sm font-bold">
                          ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs
                        </strong>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-300">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 bg-[#0B101E]/60 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          Evidence Type: <strong className="text-white uppercase">{ring.evidence_type}</strong>
                        </span>
                        <span className="text-rose-500 font-bold">
                          Risk Level: {ring.risk_level}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onSelectRing(ring)}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Open Crime Syndicate Intelligence Drawer</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
