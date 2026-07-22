import React from 'react';
import { FilterState, ViewMode } from '../types/fraud';
import { ChevronDown } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalCases: number;
  filteredCount: number;
  currentView: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCases,
  filteredCount,
  currentView,
  onViewChange
}) => {
  return (
    <div className="namma-toolbar select-none">
      {/* Left Filter Dropdown Pills (NammaKasa Exact 1:1) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Severity Filter */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange({ severity: e.target.value as any })}
            className="namma-select-pill"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical (90+)</option>
            <option value="high">High (75-89)</option>
            <option value="medium">Medium (50-74)</option>
            <option value="low">Low (&lt;50)</option>
          </select>
          <ChevronDown style={{ width: '14px', height: '14px', color: '#94A3B8', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Status Filter */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as any })}
            className="namma-select-pill"
          >
            <option value="all">All Status</option>
            <option value="active">Active Rings</option>
            <option value="in_progress">Under Investigation</option>
            <option value="resolved">Resolved</option>
          </select>
          <ChevronDown style={{ width: '14px', height: '14px', color: '#94A3B8', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Linkage Type Filter */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={filters.linkageType}
            onChange={(e) => onFilterChange({ linkageType: e.target.value as any })}
            className="namma-select-pill"
          >
            <option value="all">All Linkage Types</option>
            <option value="script-only-linked">✨ Script-Only Linked</option>
            <option value="hard-identifier-linked">🔗 Hard Identifier</option>
            <option value="mixed-evidence">⚡ Mixed Evidence</option>
          </select>
          <ChevronDown style={{ width: '14px', height: '14px', color: '#94A3B8', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Right View Switcher Pill (NammaKasa Exact Map/List Toggle) */}
      <div className="namma-view-switcher">
        <button
          onClick={() => onViewChange('map')}
          className={`namma-view-btn ${currentView === 'map' ? 'namma-view-btn-active' : ''}`}
        >
          Map
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`namma-view-btn ${currentView === 'list' ? 'namma-view-btn-active' : ''}`}
        >
          List
        </button>
        <button
          onClick={() => onViewChange('graph')}
          className={`namma-view-btn ${currentView === 'graph' ? 'namma-view-btn-active' : ''}`}
        >
          Graph
        </button>
        <button
          onClick={() => onViewChange('reports')}
          className={`namma-view-btn ${currentView === 'reports' ? 'namma-view-btn-active' : ''}`}
        >
          Reports
        </button>
      </div>
    </div>
  );
};
