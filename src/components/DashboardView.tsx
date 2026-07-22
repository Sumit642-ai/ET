import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { ShieldAlert, Users, Landmark, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
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

  return (
    <div className="w-full h-[calc(100vh-170px)] bg-slate-50 p-6 overflow-y-auto font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Total Funds At Risk</span>
              <Landmark className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              ₹{(totalAmountAtRisk / 10000000).toFixed(2)} Cr
            </div>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% vs last week
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Active Fraud Rings</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {rings.length} Syndicates
            </div>
            <p className="text-[11px] text-rose-600 font-bold">
              3 High Urgency Threats
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Total Complaints</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              6,893 Active
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              West Bengal & Kolkata Metro
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Mule Accounts Frozen</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 font-display">
              142 VPAs
            </div>
            <p className="text-[11px] text-emerald-600 font-bold">
              Emergency Debit Freeze
            </p>
          </div>
        </div>

        {/* Recharts Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: BarChart — Funds at Risk by District */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm font-display">
                Total Funds at Risk (₹ Lakhs) by District
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">Real-time Ingestion</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DISTRICT_FUNDS_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`₹${val} Lakhs`, 'Funds at Risk']}
                  />
                  <Bar dataKey="funds" fill="#DC2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Donut Chart — Active Syndicates by Category */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
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
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: AreaChart — Case Velocity Timeline */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              Complaint Velocity & Clustering Rate Timeline
            </h3>
            <span className="text-[11px] text-rose-600 font-bold">7-Day Spike Detected</span>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="complaints" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Syndicates Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 font-display mb-4">
            Active Chakravyuh Crime Rings Overview
          </h3>

          <div className="space-y-3">
            {rings.map((ring) => (
              <div 
                key={ring.ring_id}
                onClick={() => onSelectRing(ring)}
                className="p-4 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-gray-200 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {ring.ring_id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ring.ring_name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {ring.customers_affected} Victims across {ring.cities.join(', ')}
                  </p>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Funds at Risk</span>
                    <strong className="text-rose-600 font-mono text-sm font-bold">
                      ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} L
                    </strong>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
