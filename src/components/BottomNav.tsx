import React from 'react';
import { Smartphone, BarChart2 } from 'lucide-react';

interface BottomNavProps {
  onOpenIntake: () => void;
  activeRingCount: number;
  totalAtRisk: number;
  totalReportCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenIntake,
  totalReportCount
}) => {
  return (
    <div className="namma-bottom-wrapper select-none">
      {/* Floating Center Dark Navy Capsule (Exact NammaKasa Match) */}
      <button
        type="button"
        onClick={() => onOpenIntake()}
        className="namma-bottom-capsule font-sans"
        title="Click to Scan QR or Submit Fraud Report"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
          <span>Scan QR to Report</span>
        </div>
      </button>

      {/* Far Right White Stat Box (Exact NammaKasa 1:1) */}
      <button 
        type="button"
        onClick={() => onOpenIntake()}
        className="namma-bottom-stat-btn"
        title="Click to Add New Report"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BarChart2 style={{ width: '16px', height: '16px', color: '#64748B', marginBottom: '2px' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', lineHeight: 1 }}>
            {totalReportCount}
          </span>
        </div>
      </button>
    </div>
  );
};
