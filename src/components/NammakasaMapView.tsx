import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FraudCase, FraudRing } from '../types/fraud';
import { Crosshair, Plus, Minus, ArrowUpRight, Smartphone } from 'lucide-react';

interface NammakasaMapViewProps {
  cases: FraudCase[];
  rings: FraudRing[];
  onSelectRing: (ring: FraudRing) => void;
  onSelectCase: (c: FraudCase) => void;
  onOpenIntake: () => void;
  activeRingCount: number;
  totalAmountAtRisk: number;
}

// Center of West Bengal / Kolkata
const CENTER_KB: [number, number] = [22.5726, 88.3639];

// Polygon Overlays for Kolkata / WB Fraud Hotspots
const HOTSPOT_POLYGONS: Array<{ name: string; bounds: [number, number][]; color: string }> = [
  {
    name: 'Kolkata Central & Burrabazar Financial Hotspot',
    bounds: [
      [22.6100, 88.3400],
      [22.6100, 88.4200],
      [22.5200, 88.4200],
      [22.5200, 88.3400]
    ],
    color: '#e5383b'
  }
];

// Custom Controls Component for 1:1 NammaKasa Zoom & GPS Locate stack
const MapControls: React.FC = () => {
  const map = useMap();

  return (
    <div className="absolute bottom-24 right-5 z-[999] flex flex-col gap-2 select-none">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col divide-y divide-gray-100">
        <button
          onClick={() => map.locate()}
          className="w-10 h-10 hover:bg-gray-50 text-slate-700 flex items-center justify-center transition-colors"
          title="Locate Me"
        >
          <Crosshair className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={() => map.zoomIn()}
          className="w-10 h-10 hover:bg-gray-50 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors"
          title="Zoom In"
        >
          <Plus className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-10 h-10 hover:bg-gray-50 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5 text-slate-700" />
        </button>
      </div>
    </div>
  );
};

export const NammakasaMapView: React.FC<NammakasaMapViewProps> = ({
  cases,
  rings,
  onSelectRing,
  onSelectCase,
  onOpenIntake,
  activeRingCount,
  totalAmountAtRisk
}) => {
  // Single Pin Icon
  const pinIcon = useMemo(() => {
    return L.divIcon({
      html: `<div class="w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-md pin-pulse"></div>`,
      className: 'custom-single-pin',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  }, []);

  // NammaKasa Dark Maroon Circle Markers
  const createNammaClusterIcon = (count: number, isScriptOnly: boolean) => {
    let sizeClass = 'cluster-sm';
    if (count > 4) sizeClass = 'cluster-lg';
    else if (count > 2) sizeClass = 'cluster-md';

    return L.divIcon({
      html: `
        <div class="namma-cluster-icon ${sizeClass} flex items-center justify-center shadow-lg">
          <span class="font-extrabold text-white text-sm">${count}</span>
        </div>
      `,
      className: 'custom-namma-leaflet-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  };

  return (
    <div className="map-canvas-wrapper relative select-none w-full min-h-[500px]" style={{ height: 'calc(100vh - 170px)' }}>
      {/* NammaKasa Exact 1:1 Floating Stats Card */}
      <div className="namma-map-stats border border-gray-100 shadow-md">
        <div className="stat-item border-r border-gray-200 pr-4">
          <span className="stat-val stat-val-active">
            ₹{(totalAmountAtRisk / 10000000).toFixed(2)} Cr
          </span>
          <span className="stat-lbl">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-val stat-val-total">
            {activeRingCount}
          </span>
          <span className="stat-lbl">Rings</span>
        </div>
      </div>

      {/* CartoDB Positron Light Greyscale Map Canvas */}
      <MapContainer
        center={CENTER_KB}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] z-10"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Hotspot Polygon */}
        {HOTSPOT_POLYGONS.map((poly, i) => (
          <Polygon
            key={i}
            positions={poly.bounds}
            pathOptions={{
              color: '#fca5a5',
              fillColor: '#fca5a5',
              fillOpacity: 0.3,
              weight: 1.5
            }}
          />
        ))}

        {/* Render NammaKasa Dark Red Cluster Bubbles */}
        {rings.map((ring) => {
          const ringMemberCases = cases.filter(c => ring.member_case_ids.includes(c.case_id));
          if (ringMemberCases.length === 0) return null;

          const avgLat = ringMemberCases.reduce((acc, c) => acc + c.lat, 0) / ringMemberCases.length;
          const avgLng = ringMemberCases.reduce((acc, c) => acc + c.lng, 0) / ringMemberCases.length;
          const isScriptOnly = ring.evidence_type === 'script-only-linked';

          return (
            <Marker
              key={ring.ring_id}
              position={[avgLat, avgLng]}
              icon={createNammaClusterIcon(ringMemberCases.length, isScriptOnly)}
              eventHandlers={{
                click: () => onSelectRing(ring)
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs font-sans">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded text-white ${
                      isScriptOnly ? 'bg-amber-600' : 'bg-rose-700'
                    }`}>
                      {isScriptOnly ? '✨ SCRIPT-ONLY ROTATION' : '🔗 HARD IDENTIFIER LINKED'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {ring.ring_name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1">
                    <strong>{ring.customers_affected} Victims</strong> across {ring.cities.join(', ')}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700">
                      ₹{(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs
                    </span>
                    <button
                      onClick={() => onSelectRing(ring)}
                      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-md text-[11px] transition-colors"
                    >
                      Inspect Ring <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Individual Pin Markers */}
        {cases.map((c) => {
          if (!c.lat || !c.lng || isNaN(c.lat) || isNaN(c.lng)) return null;

          return (
            <Marker
              key={c.case_id}
              position={[c.lat, c.lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => onSelectCase(c)
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs font-sans">
                  <span className="text-[10px] font-mono font-bold text-rose-700">{c.case_id}</span>
                  <h4 className="font-bold text-slate-900 text-xs mt-0.5">{c.victim_name} ({c.city})</h4>
                  <p className="text-[11px] text-slate-600 mt-1">{c.ward_or_area}</p>
                  <p className="text-xs font-bold text-rose-800 mt-1">₹{(c.amount / 100000).toFixed(2)} Lakhs</p>
                  <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">"{c.transcript_text}"</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapControls />
      </MapContainer>
    </div>
  );
};
