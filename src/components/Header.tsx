import React, { useState } from 'react';
import { ViewMode } from '../types/fraud';
import { Building2, ChevronDown, User, Shield } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenIntake: () => void;
  activeRingCount: number;
  totalAtRisk: number;
  userRole: 'analyst' | 'police';
  onRoleChange: (role: 'analyst' | 'police') => void;
  language?: 'en' | 'bn';
  onToggleLanguage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  onRoleChange
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <header className="w-full bg-[#0B101E] text-white select-none shadow-md font-sans z-50 border-b border-[#1A2235]">
      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Brand Logo ChakraView with Red Globe Image */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 overflow-hidden flex items-center justify-center shadow-lg shadow-rose-950/50">
            <img 
              src="/red_globe_logo.png" 
              alt="ChakraView Red Globe Logo" 
              className="w-full h-full object-cover rounded-xl scale-110"
            />
          </div>
          <a href="/" className="flex items-baseline gap-0.5 no-underline">
            <span className="text-2xl font-black text-white font-display tracking-tight">Chakra</span>
            <span className="text-2xl font-black text-[#DC2626] font-display tracking-tight">View</span>
            <span className="ml-2 font-mono text-[10px] text-slate-400 font-bold bg-[#1A2235] px-2 py-0.5 rounded border border-slate-700">v1.3.5</span>
          </a>
        </div>

        {/* Right Controls: Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(prev => !prev)}
            className="flex items-center gap-2.5 bg-[#1A2235] hover:bg-slate-800 border border-slate-700/80 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${userRole === 'analyst' ? 'bg-amber-400 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/50'} shadow-sm`} />
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-200">
              {userRole === 'analyst' ? 'Bank Analyst (30% Scope)' : 'Police Admin (100% Full Scope)'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Role Selection Dropdown Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1A2235] border border-slate-700 rounded-2xl p-2 shadow-2xl z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold px-3 py-1.5 block">Select User Role Scope</span>
              <button
                onClick={() => {
                  onRoleChange('police');
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                  userRole === 'police' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Police Admin</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">100% Scope</span>
              </button>

              <button
                onClick={() => {
                  onRoleChange('analyst');
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all mt-1 ${
                  userRole === 'analyst' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Bank Analyst</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">30% Scope</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
