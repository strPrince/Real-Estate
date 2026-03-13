import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { FilterButton, FilterPanel, usePropertyFilters } from '../../components/FilterBar/FilterBar.jsx';
import PropertyCard from '../../components/PropertyCard/PropertyCard.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';
import { getProperties } from '../../api.js';
import { AlertCircle } from 'lucide-react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const query = searchParams.get('q') || '';
  const cursorStackRef = useRef([]);

  const filterKey = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('cursor');
    return params.toString();
  }, [searchParams]);

  const filterState = usePropertyFilters();

  const apiParamsKey = useMemo(() => {
    const params = new URLSearchParams();
    const intent = searchParams.get('intent') || '';
    const type = searchParams.get('type') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'newest';
    const cursorParam = searchParams.get('cursor') || '';
    if (intent) params.set('intent', intent);
    if (type) params.set('type', type);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
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
      bedrooms: searchParams.get('bedrooms') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
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

  function goNext(nextCursor) {
    if (!nextCursor) return;
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

  const normalize = (value) => (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const isSubsequence = (needle, haystack) => {
    let i = 0;
    for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
      if (haystack[j] === needle[i]) i += 1;
    }
    return i === needle.length;
  };

  const filteredProperties = useMemo(() => {
    const q = normalize(query);
    if (!q) return properties;
    const tokens = q.split(' ').filter(Boolean);
    return properties.filter((p) => {
      const hay = normalize([
        p.title,
        p.location?.locality,
        p.location?.city,
        p.location?.address,
      ].filter(Boolean).join(' '));
      return tokens.every((t) => hay.includes(t) || isSubsequence(t, hay));
    });
  }, [properties, query]);

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
                   searchParams.get('intent') === 'buy' ? 'Properties for Sale' : 'All Properties'}
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
