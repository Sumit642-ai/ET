import React, { useState } from 'react';
import { ViewMode } from '../types/fraud';
import { Shield, Mail, X } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenIntake: () => void;
  activeRingCount: number;
  totalAtRisk: number;
  language: 'en' | 'bn';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage
}) => {
  const [showNotification, setShowNotification] = useState(true);

  return (
    <header className="w-full bg-white select-none shadow-xs font-sans z-50">
      {/* 1. Top Pink Announcement Bar */}
      {showNotification && (
        <div className="namma-digest-bar">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Mail className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Join 593 Bengalureans</strong> on the Monday digest
            </span>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-rose-400 hover:text-rose-700 transition-colors p-0.5"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Navbar Row */}
      <div className="namma-header-row max-w-7xl mx-auto">
        {/* Left: Brand Logo CHAKRAVYUH */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold shadow-sm">
            <Shield className="w-4 h-4 text-rose-500" />
          </div>
          <a href="/" className="flex items-baseline gap-0.5 no-underline">
            <span className="namma-logo-text">CHAKRA</span>
            <span className="namma-logo-accent">VYUH</span>
            <span className="namma-version-tag">v1.3.5</span>
          </a>
        </div>

        {/* Right: English Language Pill Button */}
        <div className="relative">
          <button
            onClick={onToggleLanguage}
            className="namma-lang-btn font-sans"
            title="Current Language: English"
          >
            English
          </button>
        </div>
      </div>
    </header>
  );
};
