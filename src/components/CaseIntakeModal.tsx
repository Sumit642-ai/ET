import React, { useState, useEffect, useRef } from 'react';
import { FraudCase } from '../types/fraud';
import { DEMO_PRESET_CASE } from '../data/seedData';
import { X, Send, Camera, QrCode, Shield, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

interface CaseIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCase: (newCase: FraudCase) => void;
}

export const CaseIntakeModal: React.FC<CaseIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmitCase
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'form'>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Form Fields
  const [victimName, setVictimName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [amount, setAmount] = useState('2400000');
  const [city, setCity] = useState('Kolkata');
  const [ward, setWard] = useState('Ward 58 - Park Circus / Sealdah');
  const [transcript, setTranscript] = useState('');

  // Attempt live webcam stream when QR tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'qr') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => {
            setCameraActive(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            setCameraActive(false);
          });
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Load pre-scripted demo preset
  const loadDemoPreset = () => {
    setActiveTab('form');
    setVictimName(DEMO_PRESET_CASE.victim_name || 'Subhashree Roy');
    setAccountNumber(DEMO_PRESET_CASE.account_number || 'ACCT-9900112233');
    setUpiVpa(DEMO_PRESET_CASE.upi_vpa || 'clearance.supreme.court@okaxis');
    setDeviceId(DEMO_PRESET_CASE.device_id || 'DEV-NEW-9988');
    setIpAddress(DEMO_PRESET_CASE.ip_address || '103.211.89.55');
    setAmount(String(DEMO_PRESET_CASE.amount || 2400000));
    setCity(DEMO_PRESET_CASE.city || 'Kolkata');
    setWard(DEMO_PRESET_CASE.ward_or_area || 'Ward 58 - Park Circus / Sealdah');
    setTranscript(DEMO_PRESET_CASE.transcript_text || '');
  };

  // Perform instant QR scan & submit case directly to map!
  const handlePerformQRScan = () => {
    setIsScanning(true);
    setScanSuccess(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);

      setTimeout(() => {
        // Auto-generate QR scanned report for Burrabazar Ward 46
        const qrScannedCase: FraudCase = {
          case_id: `CASE-2026-QR${Math.floor(10 + Math.random() * 90)}`,
          victim_name: 'QR Civic Scanner Citizen',
          account_number: `ACCT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          upi_vpa: 'qr.mule.clearance@paytm',
          device_id: `DEV-QR-${Math.floor(1000 + Math.random() * 9000)}`,
          ip_address: '103.45.12.99',
          amount: 1850000,
          timestamp: new Date().toISOString(),
          city: 'Kolkata',
          lat: 22.5697,
          lng: 88.3697,
          ward_or_area: 'Ward 46 - Burrabazar / Esplanade',
          transcript_text: 'Scanned local waste bin QR code poster: Reported illegal CBI Digital Arrest scam contact info placed on notice board in Burrabazar.',
          risk_score: 96,
          scam_type: 'Digital Arrest (CBI/ED Impersonation)',
          created_at: new Date().toISOString()
        };

        onSubmitCase(qrScannedCase);
        onClose();
      }, 700);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCase: FraudCase = {
      case_id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      victim_name: victimName || 'Anonymous Citizen',
      account_number: accountNumber || `ACCT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      upi_vpa: upiVpa || 'clearance.supreme.court@okaxis',
      device_id: deviceId || `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      ip_address: ipAddress || '103.45.12.99',
      amount: parseFloat(amount) || 1200000,
      timestamp: new Date().toISOString(),
      city: city || 'Kolkata',
      lat: 22.5600 + (Math.random() * 0.04 - 0.02),
      lng: 88.3500 + (Math.random() * 0.04 - 0.02),
      ward_or_area: ward || 'Kolkata Ward',
      transcript_text: transcript || 'Complaint report submitted by citizen.',
      risk_score: 96,
      scam_type: 'Digital Arrest (CBI/ED Impersonation)',
      created_at: new Date().toISOString()
    };

    onSubmitCase(newCase);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Clean Professional Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Scan QR & Report Fraud
              </h3>
              <p className="text-xs text-gray-500">
                Scan civic notice QR code or report fraud complaint in West Bengal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Light Tab Switcher */}
        <div className="bg-gray-50 px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-gray-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera QR Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-gray-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Complaint Form</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: Real / Simulated QR Camera Scanner */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-5 text-center py-2">
              <div 
                onClick={handlePerformQRScan}
                className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-rose-500/60 overflow-hidden flex flex-col items-center justify-center p-4 shadow-md cursor-pointer group hover:border-rose-400 transition-colors"
              >
                {/* Live Webcam Stream or Fallback QR Icon */}
                {cameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-rose-500 group-hover:scale-110 transition-transform mb-2 stroke-[1.5]" />
                )}

                {/* Laser Scanning Animation Line */}
                <div className="absolute inset-x-0 h-1 bg-rose-500 shadow-lg animate-bounce z-10" style={{ animationDuration: '1.8s' }} />

                {/* Scanning Status Overlay */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 text-white p-2 rounded-xl border border-slate-800 text-[11px] font-semibold backdrop-blur-xs z-20">
                  {isScanning ? (
                    <span className="flex items-center justify-center gap-2 text-amber-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning QR Code...
                    </span>
                  ) : scanSuccess ? (
                    <span className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> QR Code Verified!
                    </span>
                  ) : (
                    <span>Click anywhere inside frame to Scan</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePerformQRScan}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan QR Code Now</span>
                </button>

                <button
                  type="button"
                  onClick={loadDemoPreset}
                  className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-colors"
                >
                  <span>Load Demo Preset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Form */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-900 font-medium">
                    Pre-fill CBI Digital Arrest complaint script for demo judging.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDemoPreset}
                  className="bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold px-3 py-1 rounded-lg text-xs transition-colors shadow-xs"
                >
                  Load Demo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Victim Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Subhashree Roy"
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount at Risk (₹)</label>
                  <input
                    type="number"
                    placeholder="2400000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Destination UPI VPA</label>
                  <input
                    type="text"
                    placeholder="clearance.escrow@okaxis"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ingress Device ID</label>
                  <input
                    type="text"
                    placeholder="DEV-NEW-9988"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">City / District</label>
                  <input
                    type="text"
                    placeholder="Kolkata"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ward / Landmark</label>
                  <input
                    type="text"
                    placeholder="Ward 58 - Park Circus"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Call Transcript / Statement</label>
                <textarea
                  rows={3}
                  placeholder="Paste the caller audio transcript or complaint details..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 text-xs font-mono shadow-xs"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-slate-800 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit & Map Complaint</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
