import React from 'react';
import { CaseReport } from '../types/fraud';
import { X, Printer, ShieldCheck, CheckCircle } from 'lucide-react';

interface CaseReportModalProps {
  report: CaseReport | null;
  onClose: () => void;
}

export const CaseReportModal: React.FC<CaseReportModalProps> = ({
  report,
  onClose
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-700">
                  {report.report_id}
                </span>
                <span className="text-[10px] bg-gray-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {report.generated_at}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Investigator Intelligence Report
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-5 text-xs">
          {/* Handoff Notice Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                Investigator Handoff Package Ready
              </h4>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Formatted for bank fraud operations, law enforcement cyber cell submission, and CERT-In notification.
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Executive Intelligence Summary
            </h4>
            <p className="text-slate-800 leading-relaxed font-mono">
              {report.summary_text}
            </p>
            <div className="pt-2 flex items-center justify-between text-slate-600 text-[11px] font-mono border-t border-gray-200">
              <span>Affected Victims: <strong className="text-slate-900">{report.customers_affected}</strong></span>
              <span>Total Funds At Risk: <strong className="text-rose-700 font-bold">₹{(report.total_amount_at_risk / 100000).toFixed(2)} Lakhs</strong></span>
            </div>
          </div>

          {/* Account Freeze & Target Entity Table */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Actionable Account Freeze & Target Entity Table
            </h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-gray-100 text-slate-700 text-[10px] uppercase border-b border-gray-200">
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Rationale</th>
                    <th className="p-3">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {report.freeze_table.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-rose-700">{row.entity}</td>
                      <td className="p-3 text-slate-700">{row.type}</td>
                      <td className="p-3">
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                          {row.risk_level}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px] max-w-[200px] truncate">{row.rationale}</td>
                      <td className="p-3 font-bold text-emerald-700">{row.suggested_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation & Disclaimer Note */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Law Enforcement Escalation Protocol
            </h4>
            <p className="text-slate-600 text-[11px]">
              {report.escalation_note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
