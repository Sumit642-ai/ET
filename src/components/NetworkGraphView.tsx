import React, { useEffect, useRef, useState } from 'react';
import { FraudCase, EvidenceLink, FraudRing } from '../types/fraud';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Info } from 'lucide-react';

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
  type: 'case' | 'vpa' | 'device' | 'script';
  riskScore: number;
  amount: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  caseRef?: FraudCase;
}

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
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggedNode = useRef<NodeItem | null>(null);

  // Build Nodes & Simulation Data
  const nodes = useRef<NodeItem[]>([]);

  useEffect(() => {
    const newNodes: NodeItem[] = [];
    const width = 1000;
    const height = 600;

    // Create Nodes from cases
    cases.forEach((c, idx) => {
      const angle = (idx / cases.length) * Math.PI * 2;
      const radius = 180 + Math.random() * 80;

      newNodes.push({
        id: c.case_id,
        label: c.internal_customer_id || c.victim_name || c.case_id,
        subLabel: `${c.city} • ₹${(c.amount / 100000).toFixed(1)}L`,
        type: 'case',
        riskScore: c.risk_score,
        amount: c.amount,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        caseRef: c
      });
    });

    nodes.current = newNodes;
  }, [cases]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Links
      links.forEach((link) => {
        const sourceId = link.source_case_id || link.case_id_a;
        const targetId = link.target_case_id || link.case_id_b;
        const sourceNode = nodes.current.find(n => n.id === sourceId);
        const targetNode = nodes.current.find(n => n.id === targetId);

        if (sourceNode && targetNode) {
          const isScriptOnly = (link.script_similarity_score ?? 0) > 0.40 && (link.exact_match_score ?? 0) === 0;

          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (isScriptOnly) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)'; // Amber for script-only
            ctx.lineWidth = 1.5;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.7)'; // Red for hard-linked
            ctx.lineWidth = Math.max(1.5, (link.combined_score ?? link.confidence_score ?? 0.5) * 3.5);
          }

          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Nodes
      nodes.current.forEach((node) => {
        const isHighRisk = node.riskScore >= 90;
        const isSelected = selectedNode?.id === node.id;

        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 14 : 10, 0, Math.PI * 2);

        if (isHighRisk) {
          ctx.fillStyle = '#DC2626'; // Deep Red
        } else if (node.riskScore >= 75) {
          ctx.fillStyle = '#D97706'; // Amber
        } else {
          ctx.fillStyle = '#2563EB'; // Blue
        }

        ctx.fill();
        ctx.strokeStyle = isSelected ? '#0F172A' : '#FFFFFF';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Node Labels
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(node.label, node.x + 14, node.y + 3);

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText(node.subLabel, node.x + 14, node.y + 16);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [links, transform, selectedNode]);

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-slate-50 relative select-none overflow-hidden">
      {/* Network Graph Top Info Banner */}
      <div className="absolute top-5 left-5 z-20 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg max-w-sm">
        <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm font-display">
          <Layers className="w-4 h-4" /> Multi-Signal Community Network Graph
        </div>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Visualizing pairwise connections between complaint cases. Solid red lines represent hard identifier matches (UPI / Device ID). Dashed amber lines represent NLP Script-Only rotations.
        </p>

        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Active Nodes: <strong className="text-slate-900">{nodes.current.length}</strong></span>
          <span>Linked Edges: <strong className="text-rose-600">{links.length}</strong></span>
        </div>
      </div>

      {/* Network Graph Controls */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col divide-y divide-gray-100">
          <button
            onClick={() => setTransform(t => ({ ...t, k: t.k * 1.2 }))}
            className="w-10 h-10 hover:bg-gray-50 text-slate-700 flex items-center justify-center font-bold"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTransform(t => ({ ...t, k: t.k / 1.2 }))}
            className="w-10 h-10 hover:bg-gray-50 text-slate-700 flex items-center justify-center font-bold"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
            className="w-10 h-10 hover:bg-gray-50 text-slate-700 flex items-center justify-center"
            title="Reset View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HTML5 Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={1400}
        height={800}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
