import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { ShieldAlert, Users, Landmark, AlertTriangle, ArrowUpRight, TrendingUp, Download, FileSpreadsheet } from 'lucide-react';
import { FraudRing, FraudCase } from '../types/fraud';

interface DashboardViewProps {
  cases: FraudCase[];
  rings: FraudRing[];
  onSelectRing: (ring: FraudRing) => void;
}

// 1. Static JSON array: Total Funds at Risk (₹ Lakhs) by District
const DISTRICT_FUNDS_DATA = [
  { district: 'Kolkata Central', funds: 185.0, cases: 452 },
  { district: 'Kolkata South', funds: 240.5, cases: 690 },
  { district: 'Bidhannagar', funds: 310.0, cases: 767 },
  { district: 'New Town', funds: 165.2, cases: 409 },
  { district: 'Howrah Metro', funds: 142.8, cases: 351 },
  { district: 'Siliguri Hub', funds: 198.4, cases: 435 },
  { district: 'Asansol Belt', funds: 385.0, cases: 794 },
  { district: 'Medinipur', funds: 112.0, cases: 280 },
];

// 2. Static JSON array: Active Syndicates by Category (Donut Chart)
const SYNDICATE_CATEGORY_DATA = [
  { name: 'CBI Digital Arrest', value: 42, color: '#DC2626' },
  { name: 'Customs Courier Seizure', value: 28, color: '#D97706' },
  { name: 'Telegram Task Fraud', value: 18, color: '#2563EB' },
  { name: 'Mule Escrow Rotation', value: 12, color: '#7A1C1C' },
];

// 3. Static JSON array: Case Velocity Timeline
const CASE_VELOCITY_DATA = [
  { date: 'Mon 14', complaints: 42, velocity: 12 },
  { date: 'Tue 15', complaints: 68, velocity: 18 },
  { date: 'Wed 16', complaints: 95, velocity: 27 },
  { date: 'Thu 17', complaints: 140, velocity: 45 },
  { date: 'Fri 18', complaints: 210, velocity: 62 },
  { date: 'Sat 19', complaints: 320, velocity: 88 },
  { date: 'Sun 20', complaints: 480, velocity: 115 },
  { date: 'Mon 21', complaints: 690, velocity: 142 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  rings,
  onSelectRing
}) => {
  const totalAmountAtRisk = rings.reduce((acc, r) => acc + r.total_amount_at_risk, 0);

  // One-Click Export Analytics to Excel / CSV
  const handleExportExcel = () => {
    let csvContent = "CHAKRAVIEW EXECUTIVE ANALYTICS REPORT\n\n";

    csvContent += "1. TOTAL FUNDS AT RISK BY DISTRICT (₹ LAKHS)\n";
    csvContent += "District,Funds at Risk (₹ Lakhs),Total Cases\n";
    DISTRICT_FUNDS_DATA.forEach(d => {
      csvContent += `"${d.district}",${d.funds},${d.cases}\n`;
    });

    csvContent += "\n2. ACTIVE SYNDICATES BY CATEGORY\n";
    csvContent += "Category,Active Rings Count\n";
    SYNDICATE_CATEGORY_DATA.forEach(c => {
      csvContent += `"${c.name}",${c.value}\n`;
    });

    csvContent += "\n3. ACTIVE FRAUD RINGS\n";
    csvContent += "Ring ID,Syndicate Name,Primary Scam Pattern,Affected Victims,Funds at Risk (₹),Cities,Evidence Type\n";
    rings.forEach(r => {
      csvContent += `"${r.ring_id}","${r.ring_name}","${r.primary_scam_pattern}",${r.customers_affected},${r.total_amount_at_risk},"${r.cities.join('; ')}","${r.evidence_type}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChakraView_Executive_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-[#0B101E] text-white p-6 overflow-y-auto font-sans select-none transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Toolbar with Export to Excel Button */}
        <div className="flex items-center justify-between bg-[#1A2235] p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div>
            <h2 className="text-xl font-extrabold font-display text-white">ChakraView Executive Intelligence Reports</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time threat landscape analytics & active crime ring intelligence</p>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-rose-950/50"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Export Analytics to Excel (.CSV)</span>
          </button>
        </div>

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Funds At Risk</span>
              <Landmark className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-white font-display">
              ₹{(totalAmountAtRisk / 10000000).toFixed(2)} Cr
            </div>
            <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% vs last week
            </p>
          </div>

          <div className="bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Active Fraud Rings</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-white font-display">
              {rings.length} Syndicates
            </div>
            <p className="text-[11px] text-rose-400 font-bold">
              3 High Urgency Threats
            </p>
          </div>

          <div className="bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Complaints</span>
              <Users className="w-4 h-4 text-slate-300" />
            </div>
            <div className="text-2xl font-extrabold text-white font-display">
              {cases.length * 140} Active
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              West Bengal & Kolkata Metro
            </p>
          </div>

          <div className="bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Mule Accounts Frozen</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-display">
              142 VPAs
            </div>
            <p className="text-[11px] text-emerald-400 font-bold">
              Emergency Debit Freeze
            </p>
          </div>
        </div>

        {/* Recharts Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: BarChart — Funds at Risk by District */}
          <div className="lg:col-span-2 bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm font-display">
                Total Funds at Risk (₹ Lakhs) by District
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Real-time Ingestion</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DISTRICT_FUNDS_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`₹${val} Lakhs`, 'Funds at Risk']}
                  />
                  <Bar dataKey="funds" fill="#DC2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Donut Chart — Active Syndicates by Category */}
          <div className="bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
            <h3 className="font-extrabold text-white text-sm font-display">
              Active Syndicates by Category
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SYNDICATE_CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {SYNDICATE_CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: AreaChart — Case Velocity Timeline */}
        <div className="bg-[#1A2235] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm font-display">
              Complaint Velocity & Clustering Rate Timeline
            </h3>
            <span className="text-[11px] text-rose-400 font-bold">7-Day Spike Detected</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CASE_VELOCITY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="complaints" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Syndicates Table */}
        <div className="bg-[#1A2235] rounded-2xl border border-slate-800 p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-white font-display mb-4">
            Active ChakraView Crime Rings Overview
          </h3>

          <div className="space-y-3">
            {rings.map((ring) => (
              <div 
                key={ring.ring_id}
                onClick={() => onSelectRing(ring)}
                className="p-4 rounded-xl bg-[#0B101E] hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">
                      {ring.ring_id}
                    </span>
                    <h4 className="font-bold text-white text-sm">{ring.ring_name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {ring.customers_affected} Victims across {ring.cities.join(', ')}
                  </p>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Funds at Risk</span>
                    <strong className="text-rose-400 font-mono text-sm font-bold">
                      ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} L
                    </strong>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
