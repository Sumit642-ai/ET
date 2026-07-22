import React, { useState } from 'react';
import { FraudCase, FraudRing } from '../types/fraud';
import { MapPin, ArrowUpRight, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'cases' | 'rings'>('cases');

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-slate-50 p-6 overflow-y-auto select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toggle Cases vs Rings (Clean Light UI) */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'cases'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Fraud Complaints ({cases.length})
            </button>
            <button
              onClick={() => setActiveTab('rings')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === 'rings'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Detected Fraud Rings ({rings.length})
            </button>
          </div>
        </div>

        {/* Tab 1: All Cases Grid */}
        {activeTab === 'cases' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cases.map((c) => {
              const isHighRisk = c.risk_score >= 90;

              return (
                <div
                  key={c.case_id}
                  onClick={() => onSelectCase(c)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-rose-500 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {c.case_id}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isHighRisk ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      Risk Score: {c.risk_score}/100
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mt-3 group-hover:text-rose-600 transition-colors font-display">
                    {c.victim_name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {c.ward_or_area}, {c.city}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Amount at Risk:</span>
                      <strong className="text-rose-700 font-bold text-sm">₹{(c.amount / 100000).toFixed(2)} Lakhs</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1.5 pt-1.5 border-t border-gray-200">
                      <span>UPI VPA:</span>
                      <span className="truncate max-w-[150px] font-bold text-slate-800">{c.upi_vpa}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic mt-3 line-clamp-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
                    "{c.transcript_text}"
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(c.timestamp).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Inspect Details <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Detected Fraud Rings */}
        {activeTab === 'rings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rings.map((ring) => {
              const isScriptOnly = ring.evidence_type === 'script-only-linked';

              return (
                <div
                  key={ring.ring_id}
                  onClick={() => onSelectRing(ring)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md ${
                    isScriptOnly
                      ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-gray-200 hover:border-rose-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isScriptOnly ? 'bg-amber-500 text-white shadow-sm' : 'bg-rose-600 text-white shadow-sm'
                    }`}>
                      {isScriptOnly ? '✨ SCRIPT-ONLY ROTATION' : '🔗 HARD IDENTIFIER LINKED'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {ring.customers_affected} Affected Victims
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg mt-3 font-display">
                    {ring.ring_name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1">
                    Primary Scam Pattern: <strong className="text-slate-800">{ring.primary_scam_pattern}</strong>
                  </p>

                  <div className="mt-4 p-3.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs shadow-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Total Funds At Risk</span>
                      <strong className="text-rose-600 text-lg font-mono font-bold">
                        ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] font-medium block">Geographic Footprint</span>
                      <strong className="text-slate-800 text-xs font-semibold">
                        {ring.cities.join(', ')}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> High Urgency Threat
                    </span>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm">
                      Inspect Ring Intelligence
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
