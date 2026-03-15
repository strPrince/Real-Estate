import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import localities from '../../data/localities.json';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function AutoFitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [bounds, map]);
  return null;
}

export default function LocalityMap() {
  const bounds = useMemo(() => {
    if (!localities.length) return null;
    return L.latLngBounds(localities.map((l) => [l.lat, l.lng]));
  }, []);

  if (!localities.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        Locality data is unavailable right now.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="h-80 sm:h-96 w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
        <MapContainer
          center={[localities[0].lat, localities[0].lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <AutoFitBounds bounds={bounds} />
          {localities.map((loc) => (
            <Marker key={loc.name} position={[loc.lat, loc.lng]}>
              <Popup className="locality-popup">
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{loc.name}</div>
                  <div className="text-gray-500">{loc.description}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    {loc.properties} listings · {loc.type}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
