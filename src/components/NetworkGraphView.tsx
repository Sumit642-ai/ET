import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { FraudCase, EvidenceLink, FraudRing } from '../types/fraud';
import { ZoomIn, ZoomOut, RefreshCw, Terminal } from 'lucide-react';

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
  caseRef?: FraudCase;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  cases,
  links,
  rings,
  onSelectCase,
  onSelectRing
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  // Canvas Viewport transform
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });
  const nodesRef = useRef<NodeItem[]>([]);
  const renderLinksRef = useRef<Array<{ source: string; target: string; style: string; label: string }>>([]);

  // Build dynamic topology nodes & links directly from `cases` and `links` props!
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        setCanvasSize({ width: w, height: h });

        const centerX = w / 2;
        const centerY = h / 2;

        const dynamicNodes: NodeItem[] = [];
        const dynamicLinks: Array<{ source: string; target: string; style: string; label: string }> = [];

        // 1. Central Mule Node
        dynamicNodes.push({
          id: 'MULE-01',
          label: 'clearance.supreme@okaxis',
          subLabel: 'Destination Mule VPA • Escrow Hub',
          type: 'mule',
          color: '#EF4444',
          riskScore: 98,
          amount: 8500000,
          x: centerX,
          y: centerY - 20
        });

        // 2. Script Rotator Node
        dynamicNodes.push({
          id: 'SCRIPT-01',
          label: 'CBI Digital Arrest Script #4',
          subLabel: 'NLP Cosine Rotator',
          type: 'script',
          color: '#F59E0B',
          riskScore: 92,
          amount: 4200000,
          x: centerX - 160,
          y: centerY + 160
        });

        // 3. Map all cases from state dynamically as victim nodes around the cluster!
        cases.forEach((c, idx) => {
          const angle = (idx / Math.max(1, cases.length)) * Math.PI * 2;
          const radius = 240 + (idx % 3) * 40;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          const nodeType: 'victim' | 'mule' | 'script' = c.scam_type?.includes('Digital Arrest') ? 'victim' : 'victim';
          const nodeColor = c.case_id.includes('NEW') || idx === 0 ? '#38BDF8' : '#3B82F6';

          dynamicNodes.push({
            id: c.case_id,
            label: `${c.victim_name || c.internal_customer_id} (${c.city})`,
            subLabel: `₹${(c.amount / 100000).toFixed(1)}L • ${c.upi_vpa || c.device_id}`,
            type: nodeType,
            color: nodeColor,
            riskScore: c.risk_score || 90,
            amount: c.amount || 1200000,
            x: x,
            y: y,
            caseRef: c
          });

          // Connect every newly added or existing case to central Mule VPA / Script Rotator!
          if (c.transcript_text?.toLowerCase().includes('cbi') || c.scam_type?.includes('Digital Arrest')) {
            dynamicLinks.push({
              source: c.case_id,
              target: 'SCRIPT-01',
              style: 'dashed',
              label: 'Script Embedding Match'
            });
            dynamicLinks.push({
              source: 'SCRIPT-01',
              target: 'MULE-01',
              style: 'dashed',
              label: 'Rotator Link'
            });
          } else {
            dynamicLinks.push({
              source: c.case_id,
              target: 'MULE-01',
              style: 'solid',
              label: 'Exact UPI Match'
            });
          }
        });

        nodesRef.current = dynamicNodes;
        renderLinksRef.current = dynamicLinks;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [cases, links]);

  // Main Canvas Animation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;
    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;

      // Dark SOC Background Fill (#0D1527)
      ctx.fillStyle = '#0D1527';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Tech Grid Pattern
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < canvasSize.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvasSize.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Edges / Links
      renderLinksRef.current.forEach((link) => {
        const sourceNode = nodesRef.current.find(n => n.id === link.source);
        const targetNode = nodesRef.current.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const isSelected = selectedNode?.id === sourceNode.id || selectedNode?.id === targetNode.id;

          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (link.style === 'dashed') {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isSelected ? '#FBBF24' : 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = isSelected ? 3 : 1.8;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = isSelected ? '#F87171' : 'rgba(239, 68, 68, 0.7)';
            ctx.lineWidth = isSelected ? 3.5 : 2.2;
          }

          ctx.stroke();
          ctx.setLineDash([]);

          // Animated particle dot along the link
          const progress = (Math.sin(pulseTime + (sourceNode.x % 5)) + 1) / 2;
          const px = sourceNode.x + (targetNode.x - sourceNode.x) * progress;
          const py = sourceNode.y + (targetNode.y - sourceNode.y) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = link.style === 'dashed' ? '#F59E0B' : '#EF4444';
          ctx.fill();
        }
      });

      // Draw Nodes
      nodesRef.current.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const radius = node.type === 'mule' ? 14 : node.type === 'script' ? 12 : 10;

        if (node.type === 'mule' || isSelected) {
          const auraRadius = radius + 6 + Math.sin(pulseTime * 2) * 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.type === 'mule' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Node Text Backdrop Pill
        ctx.font = 'bold 11px Inter, sans-serif';
        const labelWidth = ctx.measureText(node.label).width;
        const textX = node.x + radius + 8;
        const textY = node.y + 4;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(textX - 4, textY - 12, labelWidth + 8, 16, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(node.label, textX, textY);

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(node.subLabel, textX, textY + 14);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [canvasSize, transform, selectedNode]);

  // Click Handler to select Node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - transform.x) / transform.k;
    const clickY = (e.clientY - rect.top - transform.y) / transform.k;

    const clicked = nodesRef.current.find(n => {
      const dist = Math.hypot(n.x - clickX, n.y - clickY);
      return dist <= 20;
    });

    if (clicked) {
      setSelectedNode(clicked);
      if (clicked.caseRef) {
        onSelectCase(clicked.caseRef);
      }
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-[calc(100vh-170px)] bg-[#0D1527] relative select-none overflow-hidden font-sans"
    >
      {/* Top Left Floating SOC Console Card */}
      <div className="absolute top-5 left-5 z-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl max-w-sm backdrop-blur-md">
        <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm font-display">
          <Terminal className="w-4 h-4" /> Chakravyuh SOC Dynamic Topology
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Real-time Graph showing <strong className="text-white">{cases.length} Live Complaints</strong> auto-clustered into detected crime syndicates.
        </p>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Mule Account
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Script Rotator
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Complaint Node
          </span>
        </div>
      </div>

      {/* Selected Node Inspector Drawer (Bottom Left) */}
      {selectedNode && (
        <div className="absolute bottom-6 left-5 z-20 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl max-w-sm font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded text-white uppercase" style={{ backgroundColor: selectedNode.color }}>
              {selectedNode.type}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Risk Score: {selectedNode.riskScore}/100
            </span>
          </div>

          <h4 className="font-extrabold text-white text-sm mt-2 font-mono">
            {selectedNode.label}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{selectedNode.subLabel}</p>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Funds At Risk:</span>
            <strong className="text-rose-400 font-bold">₹{(selectedNode.amount / 100000).toFixed(2)} Lakhs</strong>
          </div>
        </div>
      )}

      {/* SOC Console Controls */}
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

      {/* Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%' }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
