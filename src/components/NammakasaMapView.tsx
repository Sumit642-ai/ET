import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { FraudCase, FraudRing } from '../types/fraud';
import { Crosshair, Plus, Minus, Sun, Moon } from 'lucide-react';

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
const CENTER_WB: [number, number] = [22.5726, 88.3639];

// Realistic West Bengal Ward & District Boundary Polygon Mesh
const WB_CHOROPLETH_BOUNDARIES: Array<{
  id: string;
  name: string;
  subName: string;
  zone: string;
  reportsCount: number;
  activeCount: number;
  bounds: [number, number][];
}> = [
  {
    id: 'WB-01',
    name: 'Burrabazar & Esplanade',
    subName: 'Central #46 - Kolkata Municipal',
    zone: 'Kolkata Central',
    reportsCount: 452,
    activeCount: 412,
    bounds: [
      [22.5850, 88.3450],
      [22.5950, 88.3650],
      [22.5750, 88.3750],
      [22.5600, 88.3500]
    ]
  },
  {
    id: 'WB-02',
    name: 'Park Circus & Sealdah',
    subName: 'South East #58 - Kolkata Municipal',
    zone: 'Kolkata South',
    reportsCount: 690,
    activeCount: 645,
    bounds: [
      [22.5600, 88.3650],
      [22.5650, 88.3900],
      [22.5400, 88.3950],
      [22.5350, 88.3650]
    ]
  },
  {
    id: 'WB-03',
    name: 'Salt Lake Sector V',
    subName: 'Tech Hub #12 - Bidhannagar',
    zone: 'Bidhannagar Corporation',
    reportsCount: 767,
    activeCount: 710,
    bounds: [
      [22.5700, 88.4200],
      [22.5900, 88.4450],
      [22.5600, 88.4550],
      [22.5450, 88.4250]
    ]
  },
  {
    id: 'WB-04',
    name: 'New Town Action Area I',
    subName: 'Smart City #04 - NKDA',
    zone: 'New Town Corporation',
    reportsCount: 409,
    activeCount: 388,
    bounds: [
      [22.5850, 88.4550],
      [22.6100, 88.4800],
      [22.5800, 88.4950],
      [22.5600, 88.4650]
    ]
  },
  {
    id: 'WB-05',
    name: 'Howrah Railway & Shibpur',
    subName: 'West #14 - Howrah Municipal',
    zone: 'Howrah Metro',
    reportsCount: 351,
    activeCount: 320,
    bounds: [
      [22.5800, 88.3200],
      [22.5950, 88.3450],
      [22.5650, 88.3400],
      [22.5500, 88.3150]
    ]
  },
  {
    id: 'WB-06',
    name: 'Alipore & Ballygunge',
    subName: 'South #69 - Kolkata Municipal',
    zone: 'Kolkata South',
    reportsCount: 182,
    activeCount: 165,
    bounds: [
      [22.5350, 88.3400],
      [22.5450, 88.3650],
      [22.5200, 88.3700],
      [22.5100, 88.3450]
    ]
  },
  {
    id: 'WB-07',
    name: 'Shyambazar & Dum Dum',
    subName: 'North #03 - Kolkata Municipal',
    zone: 'Kolkata North',
    reportsCount: 274,
    activeCount: 250,
    bounds: [
      [22.6000, 88.3700],
      [22.6250, 88.3900],
      [22.6100, 88.4100],
      [22.5900, 88.3800]
    ]
  },
  {
    id: 'WB-08',
    name: 'Jadavpur & Garia',
    subName: 'South East #96 - Kolkata Municipal',
    zone: 'Kolkata South',
    reportsCount: 320,
    activeCount: 295,
    bounds: [
      [22.5000, 88.3600],
      [22.5150, 88.3900],
      [22.4750, 88.3950],
      [22.4700, 88.3650]
    ]
  },
  {
    id: 'WB-09',
    name: 'Siliguri Commercial Hub',
    subName: 'North Bengal #08 - Siliguri MC',
    zone: 'Darjeeling District',
    reportsCount: 435,
    activeCount: 399,
    bounds: [
      [22.6200, 88.4100],
      [22.6450, 88.4350],
      [22.6300, 88.4500],
      [22.6050, 88.4200]
    ]
  },
  {
    id: 'WB-10',
    name: 'Asansol & Durgapur Steel Belt',
    subName: 'Paschim Bardhaman #19',
    zone: 'Bardhaman Belt',
    reportsCount: 794,
    activeCount: 740,
    bounds: [
      [22.5400, 88.4250],
      [22.5600, 88.4550],
      [22.5300, 88.4700],
      [22.5100, 88.4400]
    ]
  },
  {
    id: 'WB-11',
    name: 'Kharagpur & Midnapore',
    subName: 'Paschim Medinipur #07',
    zone: 'Medinipur District',
    reportsCount: 280,
    activeCount: 260,
    bounds: [
      [22.5200, 88.4700],
      [22.5450, 88.4950],
      [22.5150, 88.5100],
      [22.4950, 88.4800]
    ]
  },
  {
    id: 'WB-12',
    name: 'Malda Town & Murshidabad',
    subName: 'Ganges Border #11',
    zone: 'Malda District',
    reportsCount: 205,
    activeCount: 190,
    bounds: [
      [22.6300, 88.3700],
      [22.6550, 88.3900],
      [22.6400, 88.4100],
      [22.6150, 88.3850]
    ]
  }
];

// Dark Maroon Circle Marker Cluster Bubbles matching NammaKasa 1:1
const NAMMAKASA_MAP_CLUSTERS = [
  { id: 'WB-01', lat: 22.5726, lng: 88.3639, count: 452, ward: 'Burrabazar & Esplanade', sub: 'Central #46 - Kolkata Municipal' },
  { id: 'WB-02', lat: 22.5500, lng: 88.3800, count: 690, ward: 'Park Circus & Sealdah', sub: 'South East #58 - Kolkata Municipal' },
  { id: 'WB-03', lat: 22.5750, lng: 88.4350, count: 767, ward: 'Salt Lake Sector V', sub: 'Tech Hub #12 - Bidhannagar' },
  { id: 'WB-04', lat: 22.5950, lng: 88.4700, count: 409, ward: 'New Town Action Area I', sub: 'Smart City #04 - NKDA' },
  { id: 'WB-05', lat: 22.5700, lng: 88.3300, count: 351, ward: 'Howrah Railway & Shibpur', sub: 'West #14 - Howrah Municipal' },
  { id: 'WB-06', lat: 22.5300, lng: 88.3550, count: 182, ward: 'Alipore & Ballygunge', sub: 'South #69 - Kolkata Municipal' },
  { id: 'WB-07', lat: 22.6100, lng: 88.3800, count: 274, ward: 'Shyambazar & Dum Dum', sub: 'North #03 - Kolkata Municipal' },
  { id: 'WB-08', lat: 22.4900, lng: 88.3750, count: 320, ward: 'Jadavpur & Garia', sub: 'South East #96 - Kolkata Municipal' },
  { id: 'WB-09', lat: 22.6300, lng: 88.4250, count: 435, ward: 'Siliguri Commercial Hub', sub: 'North Bengal #08' },
  { id: 'WB-10', lat: 22.5450, lng: 88.4450, count: 794, ward: 'Asansol & Durgapur', sub: 'Paschim Bardhaman #19' },
  { id: 'WB-11', lat: 22.5300, lng: 88.4850, count: 280, ward: 'Kharagpur & Midnapore', sub: 'Paschim Medinipur #07' },
  { id: 'WB-12', lat: 22.6400, lng: 88.3850, count: 205, ward: 'Malda Town & Murshidabad', sub: 'Ganges Border #11' },
  { id: 'WB-13', lat: 22.6500, lng: 88.3600, count: 58, ward: 'Bahharampur', sub: 'Murshidabad #02' },
  { id: 'WB-14', lat: 22.6200, lng: 88.3450, count: 84, ward: 'Hooghly Chinsurah', sub: 'Hooghly #05' },
  { id: 'WB-15', lat: 22.5850, lng: 88.3100, count: 20, ward: 'Bally Ghat', sub: 'Howrah North #01' },
  { id: 'WB-16', lat: 22.5700, lng: 88.2950, count: 5, ward: 'Sankrail', sub: 'Howrah South #09' },
  { id: 'WB-17', lat: 22.5100, lng: 88.3200, count: 116, ward: 'Behala Chowrasta', sub: 'Kolkata South #121' },
  { id: 'WB-18', lat: 22.4800, lng: 88.3400, count: 99, ward: 'Tollygunge Metro', sub: 'Kolkata South #97' },
  { id: 'WB-19', lat: 22.4500, lng: 88.3500, count: 15, ward: 'Thakurpukur', sub: 'South 24 Parganas' },
  { id: 'WB-20', lat: 22.4300, lng: 88.3800, count: 104, ward: 'Baruipur Station', sub: 'Baruipur MC' },
  { id: 'WB-21', lat: 22.4700, lng: 88.4900, count: 123, ward: 'Bhangur Rajarhat', sub: 'North 24 Parganas' },
  { id: 'WB-22', lat: 22.5100, lng: 88.5200, count: 281, ward: 'Canning Salt Marshes', sub: 'Sundarbans Border' },
  { id: 'WB-23', lat: 22.5500, lng: 88.5250, count: 8, ward: 'Basirhat Border', sub: 'North 24 Parganas' },
  { id: 'WB-24', lat: 22.5600, lng: 88.5050, count: 14, ward: 'Haroa Hub', sub: 'North 24 Parganas' },
  { id: 'WB-25', lat: 22.5800, lng: 88.4900, count: 56, ward: 'Minakhan Central', sub: 'North 24 Parganas' },
  { id: 'WB-26', lat: 22.6100, lng: 88.4600, count: 11, ward: 'Kolkata Airport Gate 1', sub: 'Airport MC' },
  { id: 'WB-27', lat: 22.6350, lng: 88.4000, count: 79, ward: 'Madhyamgram', sub: 'Barasat Sub-div' }
];

export const NammakasaMapView: React.FC<NammakasaMapViewProps> = ({
  cases,
  rings,
  onSelectRing,
  onSelectCase,
  onOpenIntake,
  activeRingCount,
  totalAmountAtRisk
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedWard, setSelectedWard] = useState<typeof WB_CHOROPLETH_BOUNDARIES[0] | null>(
    WB_CHOROPLETH_BOUNDARIES[0]
  );
  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);

  // Helper function to create 1:1 NammaKasa dark maroon circle icon
  const createNammaClusterIcon = (count: number, isHovered: boolean) => {
    let sizePx = 42;
    let fontSize = '0.85rem';
    if (count >= 400) {
      sizePx = 56;
      fontSize = '1.05rem';
    } else if (count >= 150) {
      sizePx = 48;
      fontSize = '0.95rem';
    } else if (count < 50) {
      sizePx = 32;
      fontSize = '0.75rem';
    }

    if (isHovered) {
      sizePx = Math.round(sizePx * 1.18);
    }

    return L.divIcon({
      html: `
        <div 
          style="
            width: ${sizePx}px;
            height: ${sizePx}px;
            background-color: ${isHovered ? '#900C3F' : '#7A1C1C'};
            border: ${isHovered ? '3px solid #FFFFFF' : '2px solid #FFFFFF'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-weight: 800;
            font-size: ${fontSize};
            font-family: 'Outfit', sans-serif;
            box-shadow: ${isHovered ? '0 8px 24px rgba(220,38,38,0.5)' : '0 4px 14px rgba(0,0,0,0.3)'};
            transform: ${isHovered ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          "
        >
          ${count}
        </div>
      `,
      className: 'custom-namma-maroon-icon',
      iconSize: [sizePx, sizePx],
      iconAnchor: [sizePx / 2, sizePx / 2]
    });
  };

  return (
    <div className="map-canvas-wrapper relative select-none w-full min-h-[500px]" style={{ height: 'calc(100vh - 170px)' }}>
      {/* Top Left Stats Badge */}
      <div 
        className={`absolute top-5 left-5 z-[999] border rounded-xl px-4 py-2 shadow-md flex items-center gap-3 font-sans transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
        }`}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-rose-500 font-extrabold text-base font-display">6893</span>
          <span className={`font-semibold text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active</span>
        </div>
        <div className={`w-[1px] h-4 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-amber-500 font-extrabold text-base font-display">7160</span>
          <span className={`font-semibold text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Reports</span>
        </div>
      </div>

      {/* Bottom Left Active Ward Card */}
      {selectedWard && (
        <div className={`absolute bottom-6 left-5 z-[999] border rounded-2xl p-4 shadow-xl max-w-xs font-sans transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
        }`}>
          <h4 className="font-extrabold text-sm font-display leading-tight">
            {selectedWard.name}
          </h4>
          <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
            {selectedWard.subName}
          </p>
          <p className={`text-[11px] font-semibold mt-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            {selectedWard.zone}
          </p>
          <p className="text-xs font-extrabold text-rose-500 mt-2 font-display">
            {selectedWard.reportsCount} reports
          </p>
        </div>
      )}

      {/* Top Right Dark / Light Theme Toggle Button */}
      <div className="absolute top-5 right-5 z-[999]">
        <button
          onClick={() => setIsDarkMode(prev => !prev)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-105 border ${
            isDarkMode 
              ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800' 
              : 'bg-white text-slate-800 border-gray-200 hover:bg-gray-50'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
        </button>
      </div>

      {/* Map Container (Switches between CartoDB Dark Matter and CartoDB Positron) */}
      <MapContainer
        center={CENTER_WB}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] z-10"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        <TileLayer
          key={isDarkMode ? 'dark-tiles' : 'light-tiles'}
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
        />

        {/* West Bengal Light Pink / Dark Rose Choropleth Ward Mesh Layer */}
        {WB_CHOROPLETH_BOUNDARIES.map((poly) => {
          const isHovered = hoveredWardId === poly.id || selectedWard?.id === poly.id;

          return (
            <Polygon
              key={poly.id}
              positions={poly.bounds}
              pathOptions={{
                color: isHovered ? '#DC2626' : isDarkMode ? '#F87171' : '#F87171',
                fillColor: isHovered ? '#DC2626' : '#FCA5A5',
                fillOpacity: isHovered ? 0.65 : isDarkMode ? 0.35 : 0.28,
                weight: isHovered ? 3.5 : 1.2,
                dashArray: isHovered ? undefined : '2, 4'
              }}
              eventHandlers={{
                mouseover: () => {
                  setHoveredWardId(poly.id);
                  setSelectedWard(poly);
                },
                mouseout: () => {
                  setHoveredWardId(null);
                },
                click: () => {
                  setSelectedWard(poly);
                }
              }}
            />
          );
        })}

        {/* NammaKasa Dark Maroon Circle Cluster Bubbles */}
        {NAMMAKASA_MAP_CLUSTERS.map((cluster, idx) => {
          const isHovered = hoveredWardId === cluster.id || selectedWard?.id === cluster.id;

          return (
            <Marker
              key={idx}
              position={[cluster.lat, cluster.lng]}
              icon={createNammaClusterIcon(cluster.count, isHovered)}
              eventHandlers={{
                mouseover: () => {
                  setHoveredWardId(cluster.id);
                  const matchedWard = WB_CHOROPLETH_BOUNDARIES.find(w => w.id === cluster.id || w.name === cluster.ward);
                  if (matchedWard) setSelectedWard(matchedWard);
                },
                mouseout: () => {
                  setHoveredWardId(null);
                },
                click: () => {
                  const matchedWard = WB_CHOROPLETH_BOUNDARIES.find(w => w.id === cluster.id || w.name === cluster.ward);
                  if (matchedWard) setSelectedWard(matchedWard);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                <div className="p-1 text-center font-sans">
                  <strong className="block text-slate-900 text-xs font-bold">{cluster.ward}</strong>
                  <span className="text-rose-600 font-extrabold text-xs">{cluster.count} Active Reports</span>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Stacked Map Controls (Locate Me, +, -) */}
        <div className="absolute bottom-6 right-5 z-[999] flex flex-col gap-2 select-none">
          <div className={`rounded-xl shadow-lg border overflow-hidden flex flex-col divide-y transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 divide-slate-800' : 'bg-white border-gray-200 divide-gray-100'
          }`}>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(() => {});
                }
              }}
              className={`w-10 h-10 flex items-center justify-center transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-slate-700'
              }`}
              title="Locate Me"
            >
              <Crosshair className="w-5 h-5" />
            </button>
            <button
              className={`w-10 h-10 flex items-center justify-center font-bold text-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-slate-700'
              }`}
              title="Zoom In"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              className={`w-10 h-10 flex items-center justify-center font-bold text-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-slate-700'
              }`}
              title="Zoom Out"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </MapContainer>
    </div>
  );
};
