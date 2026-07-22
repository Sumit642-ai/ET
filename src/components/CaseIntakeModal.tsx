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
  const [activeTab, setActiveTab] = useState<'qr' | 'form'>('form');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Form Fields matching exact compliance specifications
  const [internalCustomerId, setInternalCustomerId] = useState('');
  const [scammerAccountNumber, setScammerAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [scammerPhoneNumber, setScammerPhoneNumber] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [amount, setAmount] = useState('2400000');
  const [incidentTimestamp, setIncidentTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [city, setCity] = useState('Kolkata');
  const [ward, setWard] = useState('Ward 58 - Park Circus / Sealdah');
  const [pincode, setPincode] = useState('700017');
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

  // Load pre-scripted demo preset matching compliance schema
  const loadDemoPreset = () => {
    setActiveTab('form');
    setInternalCustomerId('CUST-88990022');
    setScammerAccountNumber('ACCT-9900112233');
    setIfscCode('UTIB0000123');
    setUpiVpa('clearance.supreme.court@okaxis');
    setScammerPhoneNumber('+91 98301 22998');
    setDeviceId('DEV-NEW-9988');
    setIpAddress('103.211.89.55');
    setAmount('2400000');
    setIncidentTimestamp('2026-07-22T14:30');
    setCity('Kolkata');
    setWard('Ward 58 - Park Circus / Sealdah');
    setPincode('700017');
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
        const qrScannedCase: FraudCase = {
          case_id: `CASE-2026-QR${Math.floor(10 + Math.random() * 90)}`,
          internal_customer_id: `CUST-QR-${Math.floor(100000 + Math.random() * 900000)}`,
          victim_name: 'Anonymous Citizen',
          account_number: `ACCT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          scammer_account_number: `ACCT-MULE-${Math.floor(100000 + Math.random() * 900000)}`,
          ifsc_code: 'PYTM0123456',
          scammer_phone_number: '+91 98310 99881',
          upi_vpa: 'qr.mule.clearance@paytm',
          device_id: `DEV-QR-${Math.floor(1000 + Math.random() * 9000)}`,
          ip_address: '103.45.12.99',
          amount: 1850000,
          timestamp: new Date().toISOString(),
          incident_timestamp: new Date().toISOString(),
          city: 'Kolkata',
          lat: 22.5697,
          lng: 88.3697,
          ward_or_area: 'Ward 46 - Burrabazar / Esplanade',
          pincode: '700007',
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
      internal_customer_id: internalCustomerId || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
      victim_name: 'Anonymous Citizen',
      account_number: `ACCT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      scammer_account_number: scammerAccountNumber || 'ACCT-9900112233',
      ifsc_code: ifscCode || 'UTIB0000123',
      scammer_phone_number: scammerPhoneNumber || '+91 98301 22998',
      upi_vpa: upiVpa || 'clearance.supreme.court@okaxis',
      device_id: deviceId || `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      ip_address: ipAddress || '103.45.12.99',
      amount: parseFloat(amount) || 1200000,
      timestamp: new Date().toISOString(),
      incident_timestamp: incidentTimestamp || new Date().toISOString(),
      city: city || 'Kolkata',
      lat: 22.5600 + (Math.random() * 0.04 - 0.02),
      lng: 88.3500 + (Math.random() * 0.04 - 0.02),
      ward_or_area: ward || 'Kolkata Ward',
      pincode: pincode || '700017',
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
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Fraud Incident Complaint Intake
              </h3>
              <p className="text-xs text-gray-500">
                Enter structured PII-compliant complaint details to map & detect fraud rings.
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

        {/* Tab Switcher */}
        <div className="bg-gray-50 px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 w-full">
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
              <span>Complaint Intake Form</span>
            </button>
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
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: Structured Complaint Form matching all 12 compliance fields */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-900 font-medium">
                    Auto-fill CBI Digital Arrest script for demo judging.
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
                {/* 1. Internal Case ID / Customer ID */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Internal Case ID / Customer ID <span className="text-rose-600 text-[10px] font-normal">(Replaces victim name for DPDP PII compliance)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CUST-88990022"
                    value={internalCustomerId}
                    onChange={(e) => setInternalCustomerId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                    required
                  />
                </div>

                {/* 2. Amount at Risk (₹) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount at Risk (₹)</label>
                  <input
                    type="number"
                    placeholder="2400000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                    required
                  />
                </div>

                {/* 3. Scammer Bank Account Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Scammer Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ACCT-9900112233"
                    value={scammerAccountNumber}
                    onChange={(e) => setScammerAccountNumber(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                {/* 4. Bank IFSC Code */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bank IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. UTIB0000123"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs uppercase"
                  />
                </div>

                {/* 5. Destination UPI VPA */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Destination UPI VPA</label>
                  <input
                    type="text"
                    placeholder="e.g. clearance.supreme.court@okaxis"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                    required
                  />
                </div>

                {/* 6. Scammer Phone Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Scammer Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98301 22998"
                    value={scammerPhoneNumber}
                    onChange={(e) => setScammerPhoneNumber(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                {/* 7. Ingress Device ID */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ingress Device ID</label>
                  <input
                    type="text"
                    placeholder="e.g. DEV-NEW-9988"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                {/* 8. IP Address */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 103.211.89.55"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>

                {/* 9. Incident Timestamp (Date & Time) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Incident Timestamp (Date & Time)</label>
                  <input
                    type="datetime-local"
                    value={incidentTimestamp}
                    onChange={(e) => setIncidentTimestamp(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
                  />
                </div>

                {/* 10. City / District */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City / District</label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
                    required
                  />
                </div>

                {/* Ward & Landmark */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ward / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 58 - Park Circus"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
                  />
                </div>

                {/* 11. Pin Code */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pin Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 700017"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono font-medium shadow-xs"
                  />
                </div>
              </div>

              {/* 12. Call Transcript / Statement (Unstructured text box) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Call Transcript / Statement <span className="text-slate-400 font-normal text-[11px]">(Unstructured text box for NLP script embedding analysis)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste the caller audio transcript or complaint details..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 text-xs font-mono shadow-xs"
                  required
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

          {/* TAB 2: Camera Scanner */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-5 text-center py-2">
              <div 
                onClick={handlePerformQRScan}
                className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-rose-500/60 overflow-hidden flex flex-col items-center justify-center p-4 shadow-md cursor-pointer group hover:border-rose-400 transition-colors"
              >
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

                <div className="absolute inset-x-0 h-1 bg-rose-500 shadow-lg animate-bounce z-10" style={{ animationDuration: '1.8s' }} />

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
        </div>
      </div>
    </div>
  );
};
