import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { FilterButton, FilterPanel, usePropertyFilters } from '../../components/FilterBar/FilterBar.jsx';
import PropertyCard from '../../components/PropertyCard/PropertyCard.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';
import { getProperties } from '../../api.js';
import { AlertCircle } from 'lucide-react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const shouldReduceMotion = false; // useReducedMotion();
  const pageMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      };

  const reveal = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      };
  const pageLimit = 12;
  const cursor = searchParams.get('cursor') || '';
  const cursorStackRef = useRef([]);

  const filterKey = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('cursor');
    return params.toString();
  }, [searchParams]);

  const filterState = usePropertyFilters();

  const activeFilters = useMemo(() => {
    const filters = [];
    const pretty = (value) => String(value || '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
    const intent = searchParams.get('intent');
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');

    if (intent) filters.push({ key: 'intent', label: `Intent: ${pretty(intent)}` });
    if (type) filters.push({ key: 'type', label: `Type: ${pretty(type)}` });
    if (q) filters.push({ key: 'q', label: `Search: ${q}` });
    if (bedrooms) filters.push({ key: 'bedrooms', label: `Bedrooms: ${bedrooms}+` });
    if (bathrooms) filters.push({ key: 'bathrooms', label: `Bathrooms: ${bathrooms}+` });
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice).toLocaleString('en-IN') : '0';
      const max = maxPrice ? Number(maxPrice).toLocaleString('en-IN') : 'Any';
      filters.push({ key: 'price', label: `Price: ${min} – ${max}` });
    }
    if (minArea || maxArea) {
      const min = minArea ? `${minArea} sqft` : '0';
      const max = maxArea ? `${maxArea} sqft` : 'Any';
      filters.push({ key: 'area', label: `Area: ${min} – ${max}` });
    }
    return filters;
  }, [searchParams]);

  const apiParamsKey = useMemo(() => {
    const params = new URLSearchParams();
    const intent = searchParams.get('intent') || '';
    const type = searchParams.get('type') || '';
    const q = searchParams.get('q') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const bathrooms = searchParams.get('bathrooms') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const minArea = searchParams.get('minArea') || '';
    const maxArea = searchParams.get('maxArea') || '';
    const sort = searchParams.get('sort') || 'newest';
    const cursorParam = searchParams.get('cursor') || '';
    if (intent) params.set('intent', intent);
    if (type) params.set('type', type);
    if (q) params.set('q', q);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minArea) params.set('minArea', minArea);
    if (maxArea) params.set('maxArea', maxArea);
    if (sort) params.set('sort', sort);
    if (cursorParam) params.set('cursor', cursorParam);
    params.set('limit', String(pageLimit));
    return params.toString();
  }, [searchParams]); // cursor is searchParams.get('cursor') — no need to list separately

  // Set page meta once on mount — not tied to filter/page changes
  useEffect(() => {
    document.title = 'Browse Properties - Property Master Vadodara';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Search and filter extensive property listings in Vadodara. Find homes, rentals, commercial spaces or land with Property Master Vadodara.');
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = {
      intent: searchParams.get('intent') || '',
      type: searchParams.get('type') || '',
      q: searchParams.get('q') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minArea: searchParams.get('minArea') || '',
      maxArea: searchParams.get('maxArea') || '',
      sort: searchParams.get('sort') || 'newest',
      limit: pageLimit,
      cursor: cursor || '',
    };

    getProperties(params)
      .then((data) => {
        if (cancelled) return;
        setProperties(data.properties || []);
        setHasMore(Boolean(data.hasMore));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [apiParamsKey]);

  useEffect(() => {
    cursorStackRef.current = [];
  }, [filterKey]);

  useEffect(() => {
    if (!currentUser && searchParams.get('cursor')) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, searchParams, navigate]);

  function goNext(nextCursor) {
    if (!nextCursor) return;
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    const params = new URLSearchParams(searchParams);
    cursorStackRef.current.push(cursor);
    params.set('cursor', nextCursor);
    setSearchParams(params);
  }

  function goPrev() {
    const prevCursor = cursorStackRef.current.pop();
    const params = new URLSearchParams(searchParams);
    if (prevCursor) params.set('cursor', prevCursor);
    else params.delete('cursor');
    setSearchParams(params);
  }

  function handleApply() {
    filterState.apply();
    setFilterOpen(false);
  }

  function handleReset() {
    filterState.reset();
    setFilterOpen(false);
  }

  const filteredProperties = properties;

  const cardMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] },
      };

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.main {...pageMotion} className="min-h-screen bg-gray-50">
          <m.section {...reveal} className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* header with eyebrow */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                  Browse
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 text-balance">
                  {searchParams.get('intent') === 'rent' ? 'Properties for Rent' :
                   searchParams.get('intent') === 'buy' ? 'Properties for Sale' :
                   searchParams.get('intent') === 'commercial' ? 'Commercial Properties' : 'All Properties'}
                </h1>
                {!loading && !error && (
                  <p className="text-gray-400 mt-1 text-sm">
                    Showing {filteredProperties.length} properties
                  </p>
                )}
              </div>
              <FilterButton activeCount={filterState.activeCount} onOpen={() => setFilterOpen(true)} />
            </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Grid */}
            <div className="flex-1 min-w-0">
              {activeFilters.length > 0 && (
                <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-4 py-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold mr-1">
                    Active
                  </span>
                  {activeFilters.map((f) => (
                    <span
                      key={f.key}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-100"
                    >
                      {f.label}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-auto text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Clear all
                  </button>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-6 py-4 rounded-xl mb-6 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                  <p className="text-xl font-semibold mb-2">No properties found</p>
                  <p className="text-sm">Try adjusting your filters or search</p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors text-sm font-semibold"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredProperties.map((p, index) => (
                        <m.div
                          key={p.id}
                          {...cardMotion}
                          transition={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  duration: 0.35,
                                  ease: [0.22, 0.61, 0.36, 1],
                                  delay: index * 0.03,
                                }
                          }
                        >
                          <PropertyCard property={p} />
                        </m.div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-12">
                      <button
                        type="button"
                        onClick={goPrev}
                        disabled={cursorStackRef.current.length === 0}
                        className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => goNext(properties[properties.length - 1]?.id)}
                        disabled={!hasMore}
                        className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  </>
              )}
            </div>

            {/* Inline filter panel (desktop) */}
            {filterOpen && (
              <aside className="hidden lg:block w-full lg:w-80 shrink-0 sticky top-24 self-start">
                <FilterPanel
                  filters={filterState.filters}
                  setFilters={filterState.setFilters}
                  set={filterState.set}
                  apply={handleApply}
                  reset={handleReset}
                  activeCount={filterState.activeCount}
                  onClose={() => setFilterOpen(false)}
                />
              </aside>
            )}
          </div>

          {/* Mobile overlay filters */}
          {filterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex items-start justify-center p-2 overflow-y-auto">
              <button
                type="button"
                aria-label="Close filters"
                className="absolute inset-0 bg-black/50"
                onClick={() => setFilterOpen(false)}
              />
              <div className="relative w-full max-w-md glass-panel rounded-2xl border border-white/60 shadow-lg overflow-hidden max-h-[calc(100vh-1rem)]">
                <FilterPanel
                  filters={filterState.filters}
                  setFilters={filterState.setFilters}
                  set={filterState.set}
                  apply={handleApply}
                  reset={handleReset}
                  activeCount={filterState.activeCount}
                  onClose={() => setFilterOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
        </m.section>
      </m.main>
      </LazyMotion>
      <Footer />
    </>
  );
}
