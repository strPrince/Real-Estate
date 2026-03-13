import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowRight, Bath, BedDouble, ChevronLeft, ChevronRight, MapPin, Maximize2 } from 'lucide-react';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80';

export default function FeaturedPropertyPreview({ properties = [], loading = false }) {
  const shouldReduceMotion = false; // useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (properties.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= properties.length) {
      setActiveIndex(0);
    }
  }, [properties, activeIndex]);

  const safeIndex = properties.length ? Math.min(activeIndex, properties.length - 1) : 0;
  const activeProperty = properties[safeIndex];

  useEffect(() => {
    setImgLoaded(false);
  }, [activeProperty?.images?.[0]]);

  const formatPrice = (n) => {
    const rupee = '\u20B9';
    if (typeof n !== 'number') return `${rupee} 0`;
    if (n >= 10_000_000) return `${rupee} ${(n / 10_000_000).toFixed(1)} Cr`;
    if (n >= 100_000) return `${rupee} ${(n / 100_000).toFixed(1)} L`;
    return `${rupee} ${n.toLocaleString('en-IN')}`;
  };

  const locationLabel = activeProperty?.location
    ? [activeProperty.location.locality, activeProperty.location.city].filter(Boolean).join(', ') || 'India'
    : 'India';

  const areaLabel = activeProperty?.area ? `${activeProperty.area} sqft` : null;
  const intentLabel = activeProperty?.intent === 'rent' ? 'For Rent' : 'For Sale';
  const titleLabel = activeProperty?.title || 'Featured property';
  const fadeMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
      };
  const imageMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
      };

  const handlePrev = () => {
    if (properties.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  const handleNext = () => {
    if (properties.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % properties.length);
  };

  const previewCount = Math.min(properties.length, 4);
  const previewIndices = Array.from({ length: previewCount }, (_, i) =>
    properties.length ? (safeIndex + i) % properties.length : 0
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
              Featured
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">Featured Property Preview</h2>
            <p className="text-gray-400 mt-1 text-sm">Tap a card to preview instantly</p>
          </div>
          <Link
            to="/properties"
            aria-label="View all properties"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition"
          >
            <span className="text-sm font-semibold">View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-4xl bg-white border border-gray-200 shadow-[0_24px_60px_-22px_rgba(15,23,42,0.2)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-slate-100/80 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.8)_0%,rgba(248,250,252,0.6)_45%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:18px_18px] opacity-40" />
          </div>

          {loading ? (
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 p-8 sm:p-12 items-center">
              <div className="space-y-6">
                <div className="bg-white/80 border border-white/70 rounded-3xl p-6 sm:p-7 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] space-y-4 animate-pulse">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-64 bg-gray-200 rounded" />
                  <div className="h-16 w-full bg-gray-200 rounded-2xl" />
                  <div className="h-4 w-52 bg-gray-200 rounded" />
                  <div className="h-8 w-full bg-gray-200 rounded" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-white/70 border border-white/70 animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-80 w-full max-w-sm rounded-3xl bg-white/70 border border-white/70 animate-pulse" />
              </div>
            </div>
          ) : properties.length === 0 ? (
            <p className="relative text-gray-500 text-center py-12">No featured properties yet.</p>
          ) : (
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 p-8 sm:p-12 items-center">
              <div className="space-y-6">
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={safeIndex}
                    {...fadeMotion}
                    className="bg-white/90 border border-white/70 rounded-3xl p-6 sm:p-7 shadow-[0_20px_45px_-18px_rgba(15,23,42,0.25)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-gray-500">
                        Spotlight
                      </span>
                      <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-brand-600">
                        {intentLabel}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3 text-balance">
                      {titleLabel}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span>{locationLabel}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {areaLabel && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                          <Maximize2 className="w-4 h-4" aria-hidden="true" /> {areaLabel}
                        </span>
                      )}
                      {activeProperty.bedrooms > 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                          <BedDouble className="w-4 h-4" aria-hidden="true" /> {activeProperty.bedrooms} Bed
                        </span>
                      )}
                      {activeProperty.bathrooms > 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                          <Bath className="w-4 h-4" aria-hidden="true" /> {activeProperty.bathrooms} Bath
                        </span>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200/70 flex items-center justify-between gap-4">
                      <div className="text-brand-600 font-semibold text-lg tabular-nums">
                        {formatPrice(activeProperty.price)}
                        {activeProperty.priceUnit === 'per_month' && (
                          <span className="text-sm font-normal text-gray-500">/mo</span>
                        )}
                      </div>
                      <Link
                        to={`/properties/${activeProperty.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </m.div>
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">
                    Quick preview
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={properties.length <= 1}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition disabled:opacity-40"
                      aria-label="Previous featured property"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={properties.length <= 1}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition disabled:opacity-40"
                      aria-label="Next featured property"
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {previewIndices.map((index) => {
                    const property = properties[index];
                    const previewTitle = property?.title || 'Featured property';
                    return (
                      <button
                        key={property.id ?? index}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`group rounded-2xl border px-3 py-3 text-left transition-all min-w-0 ${
                          index === safeIndex
                            ? 'border-brand-300 bg-brand-50 shadow-[0_12px_26px_-16px_rgba(255,122,0,0.45)]'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_14px_32px_-20px_rgba(15,23,42,0.25)]'
                        }`}
                        aria-pressed={index === safeIndex}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                            <img
                              src={property.images?.[0] || PLACEHOLDER}
                              alt={previewTitle}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-800 truncate">
                              {previewTitle}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1 truncate">
                              {formatPrice(property.price)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <AnimatePresence initial={false} mode="wait">
                  <m.div
                    key={safeIndex}
                    {...imageMotion}
                    className="relative h-[340px] sm:h-[380px] lg:h-[420px] w-full max-w-sm rounded-3xl overflow-hidden border border-white/80 shadow-[0_35px_70px_-25px_rgba(15,23,42,0.4)]"
                  >
                    <img
                      src={activeProperty.images?.[0] || PLACEHOLDER}
                      alt={titleLabel}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onLoad={() => setImgLoaded(true)}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                    />
                    {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </m.div>
                </AnimatePresence>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-600 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)]">
                  {String(safeIndex + 1).padStart(2, '0')} / {String(properties.length).padStart(2, '0')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
