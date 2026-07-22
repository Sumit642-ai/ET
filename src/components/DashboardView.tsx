import React from 'react';
import { ShieldAlert, Users, Landmark, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { FraudRing, FraudCase } from '../types/fraud';

interface DashboardViewProps {
  cases: FraudCase[];
  rings: FraudRing[];
  onSelectRing: (ring: FraudRing) => void;
}

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
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Total Funds At Risk</span>
              <Landmark className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              ₹{(totalAmountAtRisk / 10000000).toFixed(2)} Cr
            </div>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% vs last week
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
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

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
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

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
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

        {/* Active Syndicates Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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
