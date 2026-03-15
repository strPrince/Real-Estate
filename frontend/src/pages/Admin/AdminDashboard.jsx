import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAdminStats, deleteProperty } from '../../api.js';
import { PlusCircle, Pencil, Trash2, AlertCircle, Building2, Star, TrendingUp, CheckCircle2, ImageOff, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  sold: 'bg-gray-100 text-gray-600',
  rented: 'bg-brand-100 text-brand-600',
};

const formatPrice = (n) => {
  if (!n) return '—';
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [allProperties, setAllProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const data = await getAdminStats(token);
        if (!isMounted) return;
        setAllProperties(data.properties || []);
        setStats(data.stats || {});
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [getToken]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sortedProperties = useMemo(() => (
    [...allProperties].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  ), [allProperties]);

  const filteredProperties = useMemo(() => {
    if (!normalizedQuery) return sortedProperties;
    return sortedProperties.filter((p) =>
      [
        p.title,
        p.location?.locality,
        p.type,
        p.intent,
        p.status,
        p.id,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, sortedProperties]);

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const properties = filteredProperties.slice(startIndex, endIndex);
  const totalCount = stats?.total ?? allProperties.length;
  const statCards = [
    { label: 'Showing', value: totalCount, icon: Building2, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: 'Active', value: stats?.active ?? 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Featured', value: stats?.featured ?? 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'For Sale', value: stats?.forSale ?? 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleSearch(q) {
    setSearchQuery(q);
  }

  function clearSearch() {
    setSearchQuery('');
  }

  function goNext() {
    if (safePage < totalPages) setPage((p) => p + 1);
  }

  function goPrev() {
    if (safePage > 1) setPage((p) => p - 1);
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const token = await getToken();
      await deleteProperty(id, token);
      setAllProperties((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => {
        if (!prev) return prev;
        const target = allProperties.find((p) => p.id === id);
        if (!target) return prev;
        const next = { ...prev };
        next.total = Math.max(0, (prev.total ?? allProperties.length) - 1);
        const status = target.status || 'active';
        if (status === 'active') next.active = Math.max(0, (prev.active || 0) - 1);
        else if (status === 'sold') next.sold = Math.max(0, (prev.sold || 0) - 1);
        else if (status === 'rented') next.rented = Math.max(0, (prev.rented || 0) - 1);
        else next.inactive = Math.max(0, (prev.inactive || 0) - 1);
        if (target.featured) next.featured = Math.max(0, (prev.featured || 0) - 1);
        if (target.intent === 'buy') next.forSale = Math.max(0, (prev.forSale || 0) - 1);
        if (target.intent === 'rent') next.forRent = Math.max(0, (prev.forRent || 0) - 1);
        if (target.intent === 'commercial') next.commercial = Math.max(0, (prev.commercial || 0) - 1);
        return next;
      });
      toast.success('Property deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your property listings and site content</p>
        </div>
        <Link
          to="/admin/properties/new"
          className="flex items-center gap-2 bg-linear-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by title, locality, type, intent, status..."
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 shadow-sm transition-colors"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl px-5 py-4 mb-6 text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-100 rounded-full w-16" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            {searchQuery ? <Search className="w-8 h-8 text-brand-400" /> : <Building2 className="w-8 h-8 text-brand-500" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? `No results for "${searchQuery}"` : 'No properties yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try a different search term' : 'Get started by adding a new property listing'}
          </p>
          {searchQuery
            ? <button onClick={clearSearch} className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"><X className="w-4 h-4" /> Clear Search</button>
            : <Link to="/admin/properties/new" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"><PlusCircle className="w-4 h-4" /> Add Property</Link>
          }
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-semibold">Property</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Type / Intent</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Price</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Location</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-gray-400" /></div>}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate max-w-45">{p.title}</div>
                            {p.featured && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-md mt-0.5"><Star className="w-2.5 h-2.5 fill-yellow-500" /> Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-gray-700 capitalize">{p.type}</div>
                        <div className="text-xs text-gray-400 capitalize">
                          {p.intent === 'rent' ? 'For Rent' : p.intent === 'commercial' ? 'Commercial' : 'For Sale'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-brand-600 font-semibold whitespace-nowrap">{formatPrice(p.price)}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-gray-700">{p.location?.locality || p.location?.city || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/properties/${p.id}/edit`}
                            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit property"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deletingId === p.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Delete property"
                          >
                            {deletingId === p.id
                              ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

                    <div className="flex items-center justify-between gap-4 mt-5">
            <button
              type="button"
              onClick={goPrev}
              disabled={safePage <= 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              {searchQuery
                ? `Showing ${filteredProperties.length} result${filteredProperties.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `Page ${safePage} of ${totalPages} - ${filteredProperties.length} total`
              }
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={safePage >= totalPages}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}



