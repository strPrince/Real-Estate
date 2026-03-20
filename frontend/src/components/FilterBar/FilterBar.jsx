import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { getLocalities } from '../../api.js';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'pg', label: 'PG / Rental' },
];

const INTENTS = [
  { value: '', label: 'All' },
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'commercial', label: 'Commercial' },
];

const BHKS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4+ BHK' },
];

const BATHS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function FilterForm({
  filters,
  setFilters,
  set,
  apply,
  reset,
  activeCount,
  localityOptions,
  localitiesLoading,
  localitiesError,
}) {
  const selectedLocality = useMemo(
    () => (localityOptions.includes(filters.query) ? filters.query : ''),
    [filters.query, localityOptions]
  );

  return (
    <div className="space-y-5">
      {/* Intent */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Looking to</label>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
          {INTENTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, intent: value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((f) => ({ ...f, intent: value }));
                }
              }}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                filters.intent === value ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Locality */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2" htmlFor="filter-locality">Locality</label>
        <select
          id="filter-locality"
          value={selectedLocality}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
          disabled={localitiesLoading}
          name="locality"
        >
          <option value="">
            {localitiesLoading ? 'Loading localities...' : 'All Localities'}
          </option>
          {localityOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {localitiesError && (
          <p className="text-xs text-red-500 mt-2">{localitiesError}</p>
        )}
        <div className="mt-3">
          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-2" htmlFor="filter-query">
            Or type area / landmark
          </label>
          <input
            id="filter-query"
            value={filters.query}
            onChange={set('query')}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="e.g. Alkapuri, Gotri..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
            name="query"
            autoComplete="address-level2"
          />
        </div>
      </div>

      {/* Property type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2" htmlFor="filter-type">Property Type</label>
        <select 
          id="filter-type"
          value={filters.type} 
          onChange={set('type')} 
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
          name="type"
        >
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* BHK */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Bedrooms</label>
        <div className="flex flex-wrap gap-2">
          {BHKS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, bedrooms: b.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((f) => ({ ...f, bedrooms: b.value }));
                }
              }}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                filters.bedrooms === b.value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 text-gray-600 hover:border-brand-500'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Bathrooms</label>
        <div className="flex flex-wrap gap-2">
          {BATHS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, bathrooms: b.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilters((f) => ({ ...f, bathrooms: b.value }));
                }
              }}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                filters.bathrooms === b.value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-gray-200 text-gray-600 hover:border-brand-500'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Price Range (Rs)</label>
        <div className="flex gap-2">
          <input
            type="number"
            id="filter-min-price"
            value={filters.minPrice}
            onChange={set('minPrice')}
            placeholder="Min"
            className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
            name="minPrice"
            autoComplete="off"
          />
          <input
            type="number"
            id="filter-max-price"
            value={filters.maxPrice}
            onChange={set('maxPrice')}
            placeholder="Max"
            className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
            name="maxPrice"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Area range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Area Range (sq.ft)</label>
        <div className="flex gap-2">
          <input
            type="number"
            id="filter-min-area"
            value={filters.minArea}
            onChange={set('minArea')}
            placeholder="Min"
            className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
            name="minArea"
            autoComplete="off"
          />
          <input
            type="number"
            id="filter-max-area"
            value={filters.maxArea}
            onChange={set('maxArea')}
            placeholder="Max"
            className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
            name="maxArea"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2" htmlFor="filter-sort">Sort By</label>
        <select 
          id="filter-sort"
          value={filters.sort} 
          onChange={set('sort')} 
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
          name="sort"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={apply} 
          className="flex-1 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Apply Filters
        </button>
        <button 
          onClick={reset} 
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Reset
        </button>
      </div>

      {/* Active count (mobile hint) */}
      {activeCount > 0 && (
        <div className="text-xs text-gray-500">
          {activeCount} filter{activeCount > 1 ? 's' : ''} active
        </div>
      )}
    </div>
  );
}

export function usePropertyFilters() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    intent: searchParams.get('intent') || '',
    type: searchParams.get('type') || '',
    query: searchParams.get('q') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  // Sync URL -> filters when user navigates here from Hero
  useEffect(() => {
    setFilters({
      intent: searchParams.get('intent') || '',
      type: searchParams.get('type') || '',
      query: searchParams.get('q') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minArea: searchParams.get('minArea') || '',
      maxArea: searchParams.get('maxArea') || '',
      sort: searchParams.get('sort') || 'newest',
    });
  }, [searchParams.toString()]);

  function apply() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (!v) return;
      if (k === 'query') params.set('q', v);
      else params.set(k, v);
    });
    navigate(`/properties?${params.toString()}`);
  }

  function reset() {
    setFilters({
      intent: '',
      type: '',
      query: '',
      bedrooms: '',
      bathrooms: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      sort: 'newest',
    });
    navigate('/properties');
  }

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return { filters, setFilters, set, apply, reset, activeCount };
}

export function FilterButton({ activeCount, onOpen }) {
  return (
    <button
      className="group inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label="Open filters"
    >
      <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
      Filters {activeCount > 0 && <span className="bg-brand-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{activeCount}</span>}
    </button>
  );
}

export function FilterPanel({
  filters,
  setFilters,
  set,
  apply,
  reset,
  activeCount,
  onClose,
  hideHeader = false,
}) {
  const [localityOptions, setLocalityOptions] = useState([]);
  const [localitiesLoading, setLocalitiesLoading] = useState(true);
  const [localitiesError, setLocalitiesError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLocalitiesLoading(true);
    setLocalitiesError('');
    getLocalities()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.localities || [];
        const names = Array.from(
          new Set(list.map((loc) => loc?.name).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));
        setLocalityOptions(names);
      })
      .catch(() => {
        if (!cancelled) setLocalitiesError('Could not load localities.');
      })
      .finally(() => {
        if (!cancelled) setLocalitiesLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`flex flex-col h-full min-h-0 ${!hideHeader ? 'bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden max-h-[90vh]' : ''}`}>
      {!hideHeader && (
        <div className="flex justify-between items-center px-5 pt-6 pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
            aria-label="Close filters"
            className="p-2 hover:bg-gray-100 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      )}
      <div className={`flex-1 min-h-0 ${!hideHeader ? 'p-5 overflow-y-auto' : ''}`}>
        <FilterForm
          filters={filters}
          setFilters={setFilters}
          set={set}
          apply={apply}
          reset={reset}
          activeCount={activeCount}
          localityOptions={localityOptions}
          localitiesLoading={localitiesLoading}
          localitiesError={localitiesError}
        />
      </div>
    </div>
  );
}
