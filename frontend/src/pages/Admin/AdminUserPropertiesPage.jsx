import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAdminUserProperties } from '../../api.js';
import { AlertCircle, ArrowLeft, Building2, ImageOff, Star } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-600',
  sold: 'bg-gray-100 text-gray-600',
  rented: 'bg-brand-100 text-brand-600',
};

const formatPrice = (n) => {
  if (!n) return '--';
  if (n >= 10_000_000) return `INR ${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `INR ${(n / 100_000).toFixed(1)} L`;
  return `INR ${n.toLocaleString('en-IN')}`;
};

export default function AdminUserPropertiesPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const data = await getAdminUserProperties(id, token, { limit: 20 });
        if (!isMounted) return;
        setProperties(data.properties || []);
        setNextCursor(data.nextCursor || null);
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load properties');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [getToken, id]);

  async function handleLoadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const token = await getToken();
      const data = await getAdminUserProperties(id, token, { limit: 20, cursor: nextCursor });
      setProperties((prev) => [...prev, ...(data.properties || [])]);
      setNextCursor(data.nextCursor || null);
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      setError(err.message || 'Failed to load more properties');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
              <ArrowLeft className="w-4 h-4" />
              Back to users
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Properties</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Viewing listings uploaded by this user.
          </p>
        </div>
        <div className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} loaded
        </div>
      </div>

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
              </div>
            ))}
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
          <p className="text-gray-500">This user has not uploaded any properties yet.</p>
        </div>
      ) : (
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
                          {p.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-md mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-yellow-500" /> Featured
                            </span>
                          )}
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
                      <div className="text-gray-700">{p.location?.locality || p.location?.city || '--'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/properties/${p.id}/edit`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
