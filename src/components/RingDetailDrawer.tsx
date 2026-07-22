import React from 'react';
import { FraudRing, FraudCase, Recommendation } from '../types/fraud';
import { generateRingRecommendation, generateCaseReport } from '../services/evidenceEngine';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';

interface RingDetailDrawerProps {
  ring: FraudRing | null;
  cases: FraudCase[];
  onClose: () => void;
  onOpenReport: (report: any) => void;
}

export const RingDetailDrawer: React.FC<RingDetailDrawerProps> = ({
  ring,
  cases,
  onClose,
  onOpenReport
}) => {
  if (!ring) return null;

  const memberCases = cases.filter(c => ring.member_case_ids.includes(c.case_id));
  const isScriptOnly = ring.evidence_type === 'script-only-linked';
  const recommendation = generateRingRecommendation(ring, memberCases, []);

  const handleGenerateReport = () => {
    const report = generateCaseReport(ring, memberCases, recommendation);
    onOpenReport(report);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[1500] w-full max-w-xl bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-slide-in select-none">
      {/* Drawer Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
            isScriptOnly ? 'bg-amber-600' : 'bg-rose-600'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full text-white ${
                isScriptOnly ? 'bg-amber-600' : 'bg-rose-600'
              }`}>
                {isScriptOnly ? '✨ SCRIPT-ONLY ROTATION' : '🔗 HARD IDENTIFIER LINKED'}
              </span>
              <span className="text-xs font-mono font-bold text-gray-400">
                {ring.ring_id}
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mt-0.5 font-display">
              {ring.ring_name}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Financial Metrics Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <span className="text-[11px] text-gray-500 font-semibold block">Total Funds At Risk</span>
            <strong className="text-rose-600 text-xl font-mono font-bold">
              ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs
            </strong>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <span className="text-[11px] text-gray-500 font-semibold block">Affected Customers</span>
            <strong className="text-slate-900 text-xl font-mono font-bold">
              {ring.customers_affected} Victims
            </strong>
          </div>
        </div>

        {/* Action Recommendation Box */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                System Action Recommendation
              </h4>
            </div>
            <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              {recommendation.action} ENFORCED
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
            {recommendation.justification_text}
          </p>

          {/* Target Entities to Freeze */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
              Target Accounts / Mule VPAs to Freeze
            </h5>
            <div className="space-y-1.5">
              {recommendation.target_entities.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-mono text-rose-700 font-bold">{t.value}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">{t.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Member Cases Breakdown */}
        <div>
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
            Ring Member Complaints ({memberCases.length})
          </h4>
          <div className="space-y-3">
            {memberCases.map((c) => (
              <div key={c.case_id} className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-700 font-bold">{c.case_id}</span>
                  <span className="text-slate-500 font-medium">{c.ward_or_area}, {c.city}</span>
                </div>

                <div className="flex items-center justify-between text-slate-800">
                  <strong className="text-slate-900 font-bold">{c.victim_name}</strong>
                  <span className="font-mono text-rose-700 font-bold">₹{(c.amount / 100000).toFixed(2)} L</span>
                </div>

                <p className="text-[11px] text-slate-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  "{c.transcript_text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Footer CTA */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleGenerateReport}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all hover:scale-[1.01]"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Structured Investigator Case Report</span>
        </button>
      </div>
    </div>
  );
};
