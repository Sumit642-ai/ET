import React, { useState } from 'react';
import { FraudCase, EvidenceLink, FraudRing } from '../types/fraud';
import { Network, Sparkles, Shield, AlertOctagon, Info, Zap } from 'lucide-react';

interface NetworkGraphViewProps {
  cases: FraudCase[];
  links: EvidenceLink[];
  rings: FraudRing[];
  onSelectCase: (c: FraudCase) => void;
  onSelectRing: (r: FraudRing) => void;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  cases,
  links,
  rings,
  onSelectCase,
  onSelectRing
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const activeCase = cases.find(c => c.case_id === selectedCaseId);

  return (
    <div className="w-full h-[calc(100vh-165px)] bg-slate-950 relative overflow-hidden flex select-none">
      {/* Sidebar Legend & Controls */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto z-20">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-slate-100 text-sm font-display uppercase tracking-wider">
              Multi-Signal Graph Topology
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Louvain community graph clustering isolating coordinated fraud rings across India.
          </p>

          {/* Evidence Edge Legend */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 mb-5 text-xs">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Evidence Linkage Legend
            </h4>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-amber-500 rounded border border-amber-400"></div>
                <span className="font-medium text-[11px]">Script Similarity (Cosine)</span>
              </div>
              <span className="font-mono text-[10px] text-amber-400 font-bold">35% Weight</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-rose-600 rounded"></div>
                <span className="font-medium text-[11px]">Hard Identifier Overlap</span>
              </div>
              <span className="font-mono text-[10px] text-rose-400 font-bold">45% Weight</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 border-t-2 border-dashed border-sky-400"></div>
                <span className="font-medium text-[11px]">Behavioral / Temporal</span>
              </div>
              <span className="font-mono text-[10px] text-sky-400 font-bold">20% Weight</span>
            </div>
          </div>

          {/* Detected Ring List */}
          <h4 className="font-bold text-xs text-slate-300 mb-2 uppercase tracking-wider">
            Detected Fraud Rings ({rings.length})
          </h4>
          <div className="space-y-2">
            {rings.map((ring) => {
              const isScriptOnly = ring.evidence_type === 'script-only-linked';

              return (
                <div
                  key={ring.ring_id}
                  onClick={() => onSelectRing(ring)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    isScriptOnly
                      ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400'
                      : 'bg-slate-800/80 border-slate-700 hover:border-rose-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      isScriptOnly ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isScriptOnly ? '✨ SCRIPT-ONLY ROTATION' : '🔗 HARD IDENTIFIER'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ring.customers_affected} Cases
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-100 text-xs mt-1.5 leading-snug">
                    {ring.ring_name}
                  </h5>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-rose-400 font-bold font-mono">
                      ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} L
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {ring.cities.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
          Click any node on the graph to inspect victim transcript and multi-signal links.
        </div>
      </div>

      {/* Interactive Visual Graph Canvas Simulation */}
      <div className="flex-1 relative bg-slate-950 p-6 overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: `24px 24px`
          }}
        />

        {/* Nodes & Connections Canvas */}
        <div className="relative w-full h-full max-w-4xl max-h-[600px]">
          {/* SVG Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {links.map((link, idx) => {
              const caseA = cases.find(c => c.case_id === link.case_id_a);
              const caseB = cases.find(c => c.case_id === link.case_id_b);
              if (!caseA || !caseB) return null;

              // Generate deterministic coordinates for visual node layout
              const indexA = cases.indexOf(caseA);
              const indexB = cases.indexOf(caseB);

              const posXA = (indexA % 5) * 160 + 120;
              const posYA = Math.floor(indexA / 5) * 130 + 100;

              const posXB = (indexB % 5) * 160 + 120;
              const posYB = Math.floor(indexB / 5) * 130 + 100;

              const isScript = link.script_similarity_score >= 0.7;
              const isHard = link.exact_match_score >= 0.8;

              let strokeColor = '#f59e0b'; // Amber script similarity
              let strokeDash = '6 3';
              if (isHard) {
                strokeColor = '#e11d48'; // Solid red hard identifier
                strokeDash = 'none';
              }

              return (
                <line
                  key={idx}
                  x1={posXA}
                  y1={posYA}
                  x2={posXB}
                  y2={posYB}
                  stroke={strokeColor}
                  strokeWidth={Math.max(2, link.combined_score * 4)}
                  strokeDasharray={strokeDash}
                  opacity={0.8}
                />
              );
            })}
          </svg>

          {/* Node Elements */}
          {cases.map((c, i) => {
            const posX = (i % 5) * 160 + 120;
            const posY = Math.floor(i / 5) * 130 + 100;
            const isSelected = selectedCaseId === c.case_id;

            return (
              <div
                key={c.case_id}
                onClick={() => {
                  setSelectedCaseId(c.case_id);
                  onSelectCase(c);
                }}
                style={{ left: `${posX}px`, top: `${posY}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 z-10 ${
                  isSelected ? 'scale-125 z-30' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-xl border-2 transition-all ${
                  isSelected
                    ? 'bg-rose-600 border-white text-white shadow-rose-600/50 ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-rose-500'
                }`}>
                  <span className="text-[10px] font-mono leading-none">
                    {c.case_id.split('-')[2] || c.case_id}
                  </span>
                  <span className="text-[9px] font-semibold opacity-80 text-rose-300">
                    {c.city.slice(0, 3)}
                  </span>
                </div>

                {/* Node Label Tooltip */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-200 border border-slate-800 text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                  {c.victim_name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
