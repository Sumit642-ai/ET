import React, { useState } from 'react';
import { FraudCase, FraudRing } from '../types/fraud';
import { Shield, ChevronDown, ChevronUp, AlertTriangle, Landmark, Phone, Cpu, FileText, Download, ArrowUpRight, Lock, ExternalLink } from 'lucide-react';

interface ListViewProps {
  cases: FraudCase[];
  rings: FraudRing[];
  onSelectCase: (c: FraudCase) => void;
  onSelectRing: (r: FraudRing) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  cases,
  rings,
  onSelectCase,
  onSelectRing
}) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'rings'>('complaints');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(cases[0]?.case_id || null);
  const [expandedRingId, setExpandedRingId] = useState<string | null>(rings[0]?.ring_id || null);

  const toggleExpandCase = (id: string) => {
    setExpandedCaseId(prev => prev === id ? null : id);
  };

  const toggleExpandRing = (id: string) => {
    setExpandedRingId(prev => prev === id ? null : id);
  };

  const handleExportCSV = () => {
    const headers = "Case ID,Customer ID,UPI VPA,Amount,City,Risk Score,Transcript\n";
    const rows = cases.map(c => 
      `"${c.case_id}","${c.internal_customer_id}","${c.upi_vpa}",${c.amount},"${c.city}",${c.risk_score},"${c.transcript_text.replace(/"/g, '""')}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chakravyuh_Complaints_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-slate-50 dark:bg-[#0D1527] p-6 overflow-y-auto font-sans select-none transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Workspace Toolbar Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'complaints'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Complaints List ({cases.length})
            </button>
            <button
              onClick={() => setActiveTab('rings')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'rings'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Detected Crime Rings ({rings.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>Export Complaints CSV</span>
          </button>
        </div>

        {/* Tab 1: Expandable Complaints List */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {cases.map((item, idx) => {
              const isExpanded = expandedCaseId === item.case_id;

              return (
                <div 
                  key={item.case_id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    isExpanded 
                      ? 'border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/20' 
                      : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Main Summary Header */}
                  <div 
                    onClick={() => toggleExpandCase(item.case_id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
                        {item.case_id}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {item.internal_customer_id} • {item.city}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-mono">
                          VPA: <strong className="text-slate-700 dark:text-slate-300">{item.upi_vpa}</strong> | Device: {item.device_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">Amount at Risk</span>
                        <strong className="text-rose-600 font-mono text-sm font-bold">
                          ₹{(item.amount / 100000).toFixed(2)} Lakhs
                        </strong>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded 12-Field Complaint Detail Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Internal Customer ID</span>
                          <strong className="text-slate-900 dark:text-white">{item.internal_customer_id}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Scammer Bank Account</span>
                          <strong className="text-slate-900 dark:text-white">{item.scammer_account_number || 'ACCT-MULE-99001'}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Bank IFSC Code</span>
                          <strong className="text-slate-900 dark:text-white">{item.ifsc_code || 'UTIB0000123'}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Destination UPI VPA</span>
                          <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{item.upi_vpa}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Scammer Phone Number</span>
                          <strong className="text-slate-900 dark:text-white">{item.scammer_phone_number || '+91 98301 22998'}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Ingress Device ID</span>
                          <strong className="text-slate-900 dark:text-white">{item.device_id}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">IP Address</span>
                          <strong className="text-slate-900 dark:text-white">{item.ip_address || '103.45.12.99'}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">Incident Timestamp</span>
                          <strong className="text-slate-900 dark:text-white">{new Date(item.timestamp).toLocaleString()}</strong>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase block">City / District / Pin Code</span>
                          <strong className="text-slate-900 dark:text-white">{item.city} • {item.pincode || '700017'}</strong>
                        </div>
                      </div>

                      {/* Unstructured Call Transcript Box */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-gray-400 text-[10px] uppercase font-mono block">Call Transcript / Victim Statement</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                          "{item.transcript_text}"
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => onSelectCase(item)}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Emergency Freeze Mule VPA</span>
                        </button>
                        <button
                          onClick={() => onSelectCase(item)}
                          className="bg-slate-800 text-slate-200 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Subpoena Report</span>
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
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    isExpanded 
                      ? 'border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/20' 
                      : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => toggleExpandRing(ring.ring_id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
                        {ring.ring_id}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {ring.ring_name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {ring.customers_affected} Victims across {ring.cities.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Funds at Risk</span>
                        <strong className="text-rose-600 font-mono text-sm font-bold">
                          ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs
                        </strong>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-500 dark:text-slate-400">
                          Evidence Type: <strong className="text-slate-900 dark:text-white uppercase">{ring.evidence_type}</strong>
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
