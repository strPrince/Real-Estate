import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAdminUser, getAdminUserProperties, getAdminUserQueries } from '../../api.js';
import { 
  User, 
  Building2, 
  MessageSquare, 
  Mail, 
  Calendar, 
  Shield, 
  ChevronLeft, 
  Clock, 
  MapPin, 
  Tag, 
  Phone,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [userData, propsData, queriesData] = await Promise.all([
          getAdminUser(id, token),
          getAdminUserProperties(id, token),
          getAdminUserQueries(id, token)
        ]);
        
        setUser(userData);
        setProperties(propsData.properties || []);
        setQueries(queriesData.queries || []);
      } catch (err) {
        toast.error('Failed to load user details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">User not found</h2>
        <Link to="/admin/users" className="text-brand-500 hover:underline mt-4 inline-block">Back to Users</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/admin/users" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center text-2xl font-bold">
              {(user.displayName || user.email || 'U')[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.displayName || 'Unnamed User'}</h1>
              <p className="text-gray-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-center ${
            user.role === 'admin' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Shield className="w-4 h-4" />
            {user.role}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" />
              User Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">User ID</label>
                <code className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 block truncate">{user.uid}</code>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Created At</label>
                <p className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Last Login</label>
                <p className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(user.lastLoginAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-500 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
            <h3 className="font-bold text-lg mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-2xl font-bold">{properties.length}</div>
                <div className="text-xs opacity-80 uppercase tracking-wider font-semibold">Properties</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-2xl font-bold">{queries.length}</div>
                <div className="text-xs opacity-80 uppercase tracking-wider font-semibold">Inquiries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Headers */}
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'properties' 
                ? 'bg-white text-brand-500 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Properties
            </button>
            <button
              onClick={() => setActiveTab('queries')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'queries' 
                ? 'bg-white text-brand-500 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Buyer Inquiries
            </button>
          </div>

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              {properties.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No properties uploaded by this user yet.</p>
                </div>
              ) : (
                properties.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Building2 className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-gray-900 truncate">{p.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.status || 'active'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Tag className="w-3.5 h-3.5" />
                          <span className="capitalize">{p.type} • {p.intent}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{p.location?.locality || 'Unknown'}</span>
                        </div>
                        <div className="xs:col-span-2 font-bold text-brand-600">
                          ₹{p.price?.toLocaleString('en-IN') || '--'}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                        <Link 
                          to={`/admin/properties/${p.id}/edit`} 
                          className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1"
                        >
                          View/Edit Listing <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Queries Tab */}
          {activeTab === 'queries' && (
            <div className="space-y-4">
              {queries.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No inquiries received for this user's properties.</p>
                </div>
              ) : (
                queries.map((q) => (
                  <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{q.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {q.email}
                          </span>
                          {q.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {q.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg self-start">
                        {formatDate(q.createdAt)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{q.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Property:</span>
                      <Link 
                        to={`/admin/properties/${q.propertyId}/edit`} 
                        className="font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1"
                      >
                        {q.propertyTitle} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
