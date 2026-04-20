import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { Building2, LogOut, Plus } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';

export default function UserDashboardPage() {
  const { currentUser, logout, getToken } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUserProperties();
  }, []);

  const statusStyles = {
    active: 'bg-success-500/10 text-success-500',
    draft: 'bg-gray-100 text-gray-600',
    sold: 'bg-gray-100 text-gray-600',
    rented: 'bg-brand-100 text-brand-600',
    approved: 'bg-success-500/10 text-success-500',
    pending: 'bg-warning-500/10 text-warning-500',
    rejected: 'bg-error-500/10 text-error-500',
    default: 'bg-gray-100 text-gray-600',
  };

  const fetchUserProperties = async (cursor = null, append = false) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const qs = new URLSearchParams();
      if (cursor) qs.set('cursor', cursor);
      qs.set('limit', '8');
      const response = await fetch(`/api/properties/user/my-properties?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties((prev) => (append ? [...prev, ...data.properties] : data.properties));
      setNextCursor(data.nextCursor || null);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      toast.error('Failed to load your properties: ' + error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    fetchUserProperties(nextCursor, true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out: ' + error.message);
    }
  };

  const getStatusClass = (status) => statusStyles[status] || statusStyles.default;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
            Dashboard
          </span>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">My Dashboard</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 text-pretty">
                Welcome back, {currentUser?.displayName || currentUser?.email}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/post-property')}
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]"
              >
                <Plus className="w-4 h-4" />
                Post New Property
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Your Property Posts</h2>
              <p className="mt-1 text-sm text-gray-600">Manage your property listings.</p>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} variant="list" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                  <Building2 className="h-6 w-6 text-brand-500" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No properties yet</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Get started by posting your first property.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/post-property')}
                    className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]"
                  >
                    <Plus className="w-4 h-4" />
                    Post Property
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {properties.map((property) => {
                  const priceLabel = property.price && property.price > 0 ? property.price.toLocaleString() : '--';
                  const postedDate = property.createdAt
                    ? new Date(property.createdAt).toLocaleDateString()
                    : '--';

                  return (
                    <li key={property.id} className="px-6 py-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <button
                            onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                            className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors text-left"
                          >
                            {property.title}
                          </button>
                          <p className="mt-1 text-xs text-gray-500 tabular-nums">
                            INR {priceLabel}  - 7 {property.bedrooms} bed  - 7 {property.area} sqft
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(property.status)}`}
                          >
                            {property.status}
                          </span>
                          <span className="text-xs text-gray-500">Posted {postedDate}</span>
                          <button
                            onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                          >
                            View & Edit
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {!loading && hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

