import React, { useState } from 'react';
import { ViewMode } from '../types/fraud';
import { Mail, X, Instagram } from 'lucide-react';

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
  currentView,
  onViewChange,
  onOpenIntake,
  activeRingCount,
  totalAtRisk,
  language,
  onToggleLanguage
}) => {
  const [showBanner, setShowBanner] = useState(true);
  const [showLanguageTooltip, setShowLanguageTooltip] = useState(true);

  return (
    <header className="w-full select-none z-50 bg-white border-b border-slate-100">
      {/* 1. Main Top Header Bar (NammaKasa Exact 1:1 Match) */}
      <div className="namma-header-row">
        {/* Logo Text + Subtitle */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="namma-logo-text">Namma</span>
          <span className="namma-logo-accent">ಕস</span>
          <span className="namma-version-tag">v1.3.5</span>
        </div>

        {/* Right Language Pill + Tooltip + Social Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {/* Language Selector Pill */}
            <button
              onClick={onToggleLanguage}
              className="namma-lang-btn"
            >
              {language === 'bn' ? 'বাংলা' : 'ಕನ್ನಡ'}
            </button>

            {/* Black Tooltip Popup ("বাংলায় ব্যবহার করুন") */}
            {showLanguageTooltip && (
              <div className="namma-tooltip-box">
                <div className="namma-tooltip-caret" />
                <div className="namma-tooltip-content">
                  <span>{language === 'bn' ? 'বাংলায় ব্যবহার করুন' : 'ಕನ್ನಡದಲ್ಲಿ ಬಳসি'}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLanguageTooltip(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
                  >
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Social Icon (Instagram / Share Icon matching reference image) */}
          <button 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              border: '1px solid #FCA5A5', 
              background: '#FFFFFF', 
              color: '#E1306C', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Follow"
          >
            <Instagram style={{ width: '16px', height: '16px', color: '#E1306C' }} />
          </button>
        </div>
      </div>

      {/* 2. Light Pink Digest Announcement Banner */}
      {showBanner && (
        <div className="namma-digest-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail style={{ width: '14px', height: '14px', color: '#C53030' }} />
            <strong style={{ color: '#C53030' }}>Join 593 Bengalureans</strong>
            <span style={{ color: '#E53E3E' }}>on the Monday digest</span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: '2px' }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}
    </header>
  );
};
