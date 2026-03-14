import { useMemo, useState } from 'react';
import localities from '../../data/localities.json';

export default function LocalityMap() {
  const [selectedLocality, setSelectedLocality] = useState(localities[0] || null);

  const points = useMemo(() => {
    if (!localities.length) return [];

    const bounds = localities.reduce(
      (acc, locality) => ({
        minLat: Math.min(acc.minLat, locality.lat),
        maxLat: Math.max(acc.maxLat, locality.lat),
        minLng: Math.min(acc.minLng, locality.lng),
        maxLng: Math.max(acc.maxLng, locality.lng),
      }),
      {
        minLat: localities[0].lat,
        maxLat: localities[0].lat,
        minLng: localities[0].lng,
        maxLng: localities[0].lng,
      }
    );

    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;
    const padding = 12;

    return localities.map((locality) => {
      const x = ((locality.lng - bounds.minLng) / lngRange) * (100 - padding * 2) + padding;
      const y = (1 - (locality.lat - bounds.minLat) / latRange) * (100 - padding * 2) + padding;
      return { ...locality, x, y };
    });
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
      <div className="relative aspect-[5/4] w-full rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
        <svg
          viewBox="0 0 360 420"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Outlined map of Vadodara"
        >
          <path
            d="M160 20 L210 30 L250 70 L290 90 L330 140 L310 190 L340 230 L300 280 L320 330 L270 380 L210 390 L170 360 L130 370 L90 330 L80 280 L50 250 L60 200 L40 150 L70 110 L110 80 L140 40 Z"
            fill="none"
            stroke="#222222"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M110 160 L170 130 L230 140 L260 190 L240 240 L190 280 L130 250 L110 200 Z"
            fill="none"
            stroke="#e3d9cd"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeDasharray="6 8"
          />
        </svg>

        {points.map((point) => {
          const isActive = selectedLocality?.name === point.name;
          return (
            <div
              key={point.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <button
                type="button"
                onClick={() => setSelectedLocality(point)}
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-brand-500 border-brand-500'
                    : 'bg-white border-brand-500 hover:bg-brand-500'
                }`}
                aria-label={`Select ${point.name}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-brand-500'}`} />
              </button>

              {isActive && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-3 w-44">
                  <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-left shadow-[0_8px_28px_-8px_rgba(15,23,42,0.14)]">
                    <p className="text-sm font-semibold text-gray-900">{point.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{point.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{point.properties} listings</span>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                        {point.type}
                      </span>
                    </div>
                  </div>
                  <div className="mx-auto mt-[-6px] h-3 w-3 rotate-45 border border-gray-100 bg-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
