import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Briefcase, Building2, SlidersHorizontal, X, TrendingUp, Shield, Award } from 'lucide-react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

const BHKS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4+ BHK' },
];

const STATS = [
  { icon: Home, value: '2,400+', label: 'Active Listings' },
  { icon: Shield, value: '100%', label: 'Verified Builders' },
  { icon: TrendingUp, value: '₹850 Cr+', label: 'Deals Closed' },
  { icon: Award, value: '12 Yrs', label: 'Market Experience' },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1800&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1800&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1800&q=80',
];
const HERO_SLIDE_MS = 6000;

export default function Hero() {
  const navigate = useNavigate();
  const shouldReduceMotion = false; // useReducedMotion();
  const [heroIndex, setHeroIndex] = useState(0);
  const [intent, setIntent] = useState('buy');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (HERO_IMAGES.length < 2) return undefined;
    const intervalId = setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, HERO_SLIDE_MS);
    return () => clearInterval(intervalId);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams({ intent });
    const query = [search.trim(), location.trim()].filter(Boolean).join(' ');
    if (query) params.set('q', query);
    if (propertyType) params.set('type', propertyType);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/properties?${params.toString()}`);
  }

  function clearFilters() {
    setPropertyType('');
    setBedrooms('');
    setMinPrice('');
    setMaxPrice('');
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
  };

  const baseMotion = shouldReduceMotion
    ? {}
    : { variants: fadeUp, initial: 'hidden', animate: 'visible' };

  const quickFilters = [
    { label: 'Residential', type: 'residential' },
    { label: 'Commercial', type: 'commercial' },
    { label: 'Plot', type: 'plot' },
    { label: 'Under 25L', maxPrice: '2500000' },
    { label: 'Under 50L', maxPrice: '5000000' },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          <m.div
            key={heroIndex}
            aria-hidden="true"
            initial={shouldReduceMotion ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 1.05, x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1, scale: 1, x: 0 } : { opacity: 1, scale: 1.01, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: '-100%' }}
            transition={{
              duration: 1.2,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url('${HERO_IMAGES[heroIndex]}')` }}
          />
        </AnimatePresence>
        {/* Single clean dark overlay — no colour blobs */}
        <div className="absolute inset-0 bg-black/62" />
        {/* Subtle bottom vignette for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/40 to-transparent" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center lg:text-left space-y-6 pt-6 sm:pt-8 pb-10 sm:pb-14">

          {/* Eyebrow pill */}
          <m.div
            {...baseMotion}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-[10px] font-semibold uppercase tracking-[0.32em] px-3.5 py-1.5 rounded-full mx-auto lg:mx-0 bg-white/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <MapPin className="w-3 h-3 text-white" aria-hidden="true" />
            Vadodara's Premier Real Estate
          </m.div>

          {/* Headline */}
          <m.h1
            {...baseMotion}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1], delay: shouldReduceMotion ? 0 : 0.05 }}
            className="text-3xl sm:text-4xl md:text-[3.3rem] font-extrabold text-white leading-[1.06] tracking-tight text-balance"
          >
            Find Your Dream Home<br className="hidden sm:block" />
            <span className="text-brand-500"> in Vadodara</span>
          </m.h1>

          {/* Subheading */}
          <m.p
            {...baseMotion}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1], delay: shouldReduceMotion ? 0 : 0.1 }}
            className="text-white/60 text-base max-w-xl mx-auto lg:mx-0 text-pretty leading-relaxed"
          >
            Curated listings, verified builders, and expert guidance — buy, rent, or invest with total confidence.
          </m.p>

          {/* Search card */}
          <m.form
            onSubmit={handleSearch}
            {...baseMotion}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1], delay: shouldReduceMotion ? 0 : 0.15 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/70 ring-1 ring-black/5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] p-4 sm:p-5 w-full max-w-4xl mx-auto lg:mx-0"
          >
            {/* Intent toggle */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mb-4 pb-3.5 border-b border-gray-100">
              {[
                { value: 'buy', label: 'Buy', icon: Home },
                { value: 'rent', label: 'Rent', icon: Briefcase },
                { value: 'commercial', label: 'Commercial', icon: Building2 },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIntent(value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIntent(value);
                    }
                  }}
                  className={`flex items-center gap-2 px-1 pb-3 -mb-3 text-[13px] font-semibold transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    intent === value
                      ? 'border-brand-500 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search fields */}
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr_auto_auto] gap-3 items-end">
              {/* Search input */}
              <label className="text-left w-full" htmlFor="hero-search">
                <span className="text-[9px] font-bold tracking-[0.22em] text-gray-400">SEARCH</span>
                <div className="mt-1.5 flex items-center gap-3 h-10 border border-gray-200 rounded-xl px-4 bg-gray-50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="hero-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Property name, area..."
                    className="flex-1 text-[13px] outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                    name="search"
                    autoComplete="off"
                  />
                </div>
              </label>

              {/* Location input */}
              <label className="text-left w-full" htmlFor="hero-location">
                <span className="text-[9px] font-bold tracking-[0.22em] text-gray-400">LOCATION</span>
                <div className="mt-1.5 flex items-center gap-3 h-10 border border-gray-200 rounded-xl px-4 bg-gray-50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <input
                    id="hero-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Locality or landmark..."
                    className="flex-1 text-[13px] outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                    name="location"
                    autoComplete="address-level2"
                  />
                </div>
              </label>

              {/* Filter button */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold tracking-[0.22em] text-gray-400 mb-1.5 invisible select-none">FILTER</span>
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 text-[13px] font-semibold"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
              </div>

              {/* Search button */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold tracking-[0.22em] text-gray-400 mb-1.5 invisible select-none">GO</span>
                  <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 h-10 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] text-[13px]"
>
                  <Search className="w-4 h-4" aria-hidden="true" /> Find Home
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 mr-1">
                Quick Filters
              </span>
              {quickFilters.map((qf) => {
                const isActive = (qf.type && propertyType === qf.type) || (qf.maxPrice && maxPrice === qf.maxPrice);
                return (
                  <button
                    key={qf.label}
                    type="button"
                    onClick={() => {
                      if (qf.type) setPropertyType(qf.type);
                      if (qf.maxPrice) {
                        setMinPrice('');
                        setMaxPrice(qf.maxPrice);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-gray-200 text-gray-600 hover:border-brand-500 hover:text-gray-800'
                    }`}
                  >
                    {qf.label}
                  </button>
                );
              })}
            </div>
          </m.form>

        </div>
      </section>
    </LazyMotion>
  );
}
