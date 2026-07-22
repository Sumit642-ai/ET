import React from 'react';
import { CaseReport } from '../types/fraud';
import { Shield, Download, X, CheckCircle, Lock } from 'lucide-react';

interface CaseReportModalProps {
  report: CaseReport | null;
  onClose: () => void;
}

export const CaseReportModal: React.FC<CaseReportModalProps> = ({
  report,
  onClose
}) => {
  if (!report) return null;

  const handlePrintOrDownload = () => {
    const reportText = `
# CHAKRAVYUH LAW ENFORCEMENT AGENCY (LEA) SUBPOENA REPORT
Generated on: ${new Date(report.generated_at).toLocaleString()}
Report Reference ID: ${report.report_id}

## RING INTELLIGENCE OVERVIEW
- Ring ID: ${report.ring_id}
- Syndicate Name: ${report.ring_name || 'Project Chakravyuh Fraud Syndicate'}
- Total Amount at Risk: ₹${report.total_amount_at_risk.toLocaleString('en-IN')}
- Affected Citizens: ${report.customers_affected} Victims

## SUMMARY STATEMENT
${report.summary_text}

## IDENTIFIED MULE ACCOUNTS & TARGETED FREEZE TABLE
${report.freeze_table.map((row, i) => `${i + 1}. [${row.type}] ${row.entity} - ${row.suggested_action} (${row.rationale})`).join('\n')}

## LEA ESCALATION DIRECTIVE
${report.escalation_note}

---
Project Chakravyuh DPDP Compliance Clearance. Confidential Legal Subpoena.
    `.trim();

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chakravyuh_Subpoena_Report_${report.ring_id}.md`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-rose-400 font-extrabold tracking-widest uppercase block">
                Official LEA Intelligence Report
              </span>
              <h3 className="text-lg font-extrabold font-display">{report.ring_name || 'Fraud Syndicate Subpoena'}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-slate-900 dark:text-white max-h-[70vh] overflow-y-auto">
          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
              <span className="text-gray-400 text-[10px] uppercase block">Ring ID</span>
              <strong className="text-rose-600 font-extrabold">{report.ring_id}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
              <span className="text-gray-400 text-[10px] uppercase block">Total at Risk</span>
              <strong className="text-rose-600 font-extrabold">₹{(report.total_amount_at_risk / 100000).toFixed(2)}L</strong>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
              <span className="text-gray-400 text-[10px] uppercase block">Affected Victims</span>
              <strong className="text-slate-900 dark:text-white font-extrabold">{report.customers_affected} Citizens</strong>
            </div>
          </div>

          {/* Mule VPAs Section */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold font-mono uppercase text-rose-500 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Targeted Mule Accounts & VPAs Freeze Directive
            </h4>
            <div className="space-y-2 font-mono text-xs">
              {report.freeze_table.map((row, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-rose-500 font-bold block">{row.entity} ({row.type})</span>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">{row.rationale}</span>
                  </div>
                  <span className="bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded text-[10px] font-bold border border-rose-200 dark:border-rose-900">
                    {row.suggested_action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation Directive */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-1">
            <h4 className="text-xs font-extrabold font-mono uppercase text-slate-500 dark:text-slate-400">
              Cyber Cell Escalation Directive
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              {report.escalation_note}
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-400">DPDP Encrypted Legal Document</span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>

            <button
              onClick={handlePrintOrDownload}
              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Export LEA Subpoena (.MD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
