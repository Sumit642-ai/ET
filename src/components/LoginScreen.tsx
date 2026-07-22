import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: 'analyst' | 'police') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'analyst' | 'police'>('analyst');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogin = (role: 'analyst' | 'police') => {
    setIsTransitioning(true);

    // 1-Second Zoom/Fade Transition on glowing Chakravyuh visual before routing to main app
    setTimeout(() => {
      onLogin(role);
      navigate('/');
    }, 1000);
  };

  return (
    <div className={`relative min-h-screen bg-[#0D1527] text-white flex items-center justify-center p-4 overflow-hidden font-sans selection:bg-rose-600 selection:text-white select-none transition-all duration-1000 ${
      isTransitioning ? 'scale-150 opacity-0 filter blur-md' : 'scale-100 opacity-100'
    }`}>
      {/* Background Animated Chakravyuh Concentric Labyrinth Rings */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-1000 ${
        isTransitioning ? 'scale-200 rotate-180 opacity-0' : 'scale-100 opacity-25'
      }`}>
        {/* Rotating Chakravyuh Outer Ring 1 */}
        <svg 
          className="w-[700px] h-[700px] animate-spin-slow text-[#DC2626]" 
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2 1 2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
          
          {/* Labyrinth Spoke Web Rays */}
          <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
          <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
          <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
        </svg>

        {/* Counter-Rotating Inner Chakravyuh Core */}
        <svg 
          className="absolute w-[450px] h-[450px] animate-spin text-[#DC2626]" 
          style={{ animationDirection: 'reverse', animationDuration: '45s' }}
          viewBox="0 0 100 100"
        >
          <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <polygon points="50,15 80,30 80,70 50,85 20,70 20,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Radial Red Glow Gradient Overlay */}
      <div className="absolute inset-0 bg-radial from-rose-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Center Glassmorphism Login Card */}
      <div className={`relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-rose-950/40 space-y-6 transition-all duration-700 ${
        isTransitioning ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-rose-600 to-rose-900 text-white border border-rose-400/40 shadow-lg shadow-rose-950/60 mb-2">
            <Shield className="w-7 h-7" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight font-display">
            <span className="text-white">CHAKRA</span>
            <span className="text-[#DC2626]">VYUH</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            AI Multi-Signal Fraud Ring Detection Platform
          </p>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enterprise Portal Role</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRole('analyst')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === 'analyst'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Bank Analyst</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('police')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === 'police'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Police Admin</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email / Investigator ID</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={selectedRole === 'analyst' ? 'analyst.bankops@sbi.co.in (30% Scope)' : 'investigator.cyber@wbpolice.gov.in (100% Scope)'}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            </div>
          </div>
        </div>

        {/* Login Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => handleLogin(selectedRole)}
            disabled={isTransitioning}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-xl shadow-rose-950/60 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <span>{isTransitioning ? 'Entering Chakravyuh Portal...' : `Login as ${selectedRole === 'analyst' ? 'Bank Analyst' : 'Police Admin'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <Sparkles className="w-3 h-3" /> Encrypted DPDP Workspace
            </span>
            <span className="font-mono text-slate-500">v1.3.5 Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  );
};
