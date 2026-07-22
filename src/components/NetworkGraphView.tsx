import React, { useEffect, useRef, useState } from 'react';
import { FraudCase, EvidenceLink, FraudRing } from '../types/fraud';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Shield, Terminal, Filter } from 'lucide-react';

interface NetworkGraphViewProps {
  cases: FraudCase[];
  links: EvidenceLink[];
  rings: FraudRing[];
  onSelectCase: (c: FraudCase) => void;
  onSelectRing: (r: FraudRing) => void;
}

interface NodeItem {
  id: string;
  label: string;
  subLabel: string;
  type: 'mule' | 'script' | 'victim';
  color: string;
  riskScore: number;
  amount: number;
  x: number;
  y: number;
}

// Static JSON graph array representing a fraud ring (Chakravyuh SOC Console)
const STATIC_FRAUD_RING_GRAPH = {
  nodes: [
    { id: 'MULE-01', label: 'clearance.supreme@okaxis', subLabel: 'Destination Mule VPA', type: 'mule' as const, color: '#DC2626', riskScore: 98, amount: 8500000 },
    { id: 'MULE-02', label: 'ACCT-9900112233', subLabel: 'Escrow Mule Bank AC', type: 'mule' as const, color: '#DC2626', riskScore: 95, amount: 3850000 },
    { id: 'SCRIPT-01', label: 'CBI Digital Arrest Script #4', subLabel: 'NLP Cosine Rotator', type: 'script' as const, color: '#D97706', riskScore: 92, amount: 4200000 },
    { id: 'SCRIPT-02', label: 'Customs Courier Seizure Script', subLabel: 'NLP Cosine Rotator', type: 'script' as const, color: '#D97706', riskScore: 88, amount: 2800000 },
    { id: 'VICTIM-101', label: 'Subhashree Roy (Park Circus)', subLabel: 'Victim • ₹24.0L', type: 'victim' as const, color: '#2563EB', riskScore: 85, amount: 2400000 },
    { id: 'VICTIM-102', label: 'Debashis Mukherjee (Salt Lake)', subLabel: 'Victim • ₹18.5L', type: 'victim' as const, color: '#2563EB', riskScore: 82, amount: 1850000 },
    { id: 'VICTIM-103', label: 'Amitava Banerjee (Howrah)', subLabel: 'Victim • ₹32.0L', type: 'victim' as const, color: '#2563EB', riskScore: 91, amount: 3200000 },
    { id: 'VICTIM-104', label: 'Priyanka Das (New Town)', subLabel: 'Victim • ₹12.0L', type: 'victim' as const, color: '#2563EB', riskScore: 78, amount: 1200000 },
    { id: 'VICTIM-105', label: 'Siddharth Sen (Alipore)', subLabel: 'Victim • ₹45.0L', type: 'victim' as const, color: '#2563EB', riskScore: 94, amount: 4500000 },
  ],
  links: [
    { source: 'VICTIM-101', target: 'MULE-01', style: 'solid', label: 'Exact UPI VPA Match' },
    { source: 'VICTIM-102', target: 'MULE-01', style: 'solid', label: 'Exact UPI VPA Match' },
    { source: 'VICTIM-103', target: 'MULE-02', style: 'solid', label: 'Exact Bank AC Match' },
    { source: 'VICTIM-104', target: 'SCRIPT-01', style: 'dashed', label: 'Script Embedding 0.88' },
    { source: 'VICTIM-105', target: 'SCRIPT-01', style: 'dashed', label: 'Script Embedding 0.92' },
    { source: 'MULE-01', target: 'MULE-02', style: 'solid', label: 'Inter-Mule Transfer' },
    { source: 'SCRIPT-01', target: 'MULE-01', style: 'dashed', label: 'Rotator Ingress Link' },
  ]
};

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  cases,
  links,
  rings,
  onSelectCase,
  onSelectRing
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  // Canvas Viewport transform
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const nodes = useRef<NodeItem[]>([]);

  useEffect(() => {
    const width = 1000;
    const height = 600;

    // Position static nodes radially around dark SOC console
    nodes.current = STATIC_FRAUD_RING_GRAPH.nodes.map((n, idx) => {
      const angle = (idx / STATIC_FRAUD_RING_GRAPH.nodes.length) * Math.PI * 2;
      const radius = n.type === 'mule' ? 90 : n.type === 'script' ? 180 : 260;

      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
      };
    });
  }, []);

  // Main Dark Mode SOC Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Dark Navy SOC Background Fill (#0D1527)
      ctx.fillStyle = '#0D1527';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background pattern
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Links (Solid for Hard Identifiers, Dashed for Script Rotators)
      STATIC_FRAUD_RING_GRAPH.links.forEach((link) => {
        const sourceNode = nodes.current.find(n => n.id === link.source);
        const targetNode = nodes.current.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (link.style === 'dashed') {
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = '#D97706'; // Amber for script rotators
            ctx.lineWidth = 2;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = '#DC2626'; // Red for hard mule accounts
            ctx.lineWidth = 3;
          }

          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Nodes (Color Coded: Red Mule, Amber Script, Blue Victim)
      nodes.current.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;

        // Outer Glow Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 18 : 14, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#FFFFFF' : '#0F172A';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Node Title Labels
        ctx.font = 'bold 11px Inter, monospace';
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(node.label, node.x + 18, node.y + 3);

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(node.subLabel, node.x + 18, node.y + 16);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [transform, selectedNode]);

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-[#0D1527] relative select-none overflow-hidden font-sans">
      {/* SOC Dark Console Top Banner */}
      <div className="absolute top-5 left-5 z-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl max-w-sm backdrop-blur-md">
        <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm font-display">
          <Terminal className="w-4 h-4" /> Chakravyuh SOC Security Console
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Interactive graph topology representing fraud ring <strong className="text-white">RING-BRAVO-SCRIPT</strong>. Red nodes denote mule accounts, Amber denote script rotators, and Blue denote victims.
        </p>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Mule Account
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Script Rotator
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Victim
          </span>
        </div>
      </div>

      {/* SOC Console Dark Controls */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col divide-y divide-slate-800">
          <button
            onClick={() => setTransform(t => ({ ...t, k: t.k * 1.2 }))}
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTransform(t => ({ ...t, k: t.k / 1.2 }))}
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
            className="w-10 h-10 hover:bg-slate-800 text-slate-200 flex items-center justify-center"
            title="Reset View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HTML5 Dark Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={1400}
        height={800}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
