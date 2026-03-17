import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAdminUsers } from '../../api.js';
import { AlertCircle, Search, Users, X } from 'lucide-react';

const parseDate = (value) => {
  if (!value) return null;
  if (value?.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return '--';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        const data = await getAdminUsers(token);
        if (!isMounted) return;
        setUsers(data.users || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [getToken]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sortedUsers = useMemo(() => (
    [...users].sort((a, b) => {
      const aTime = parseDate(a.createdAt)?.getTime() || 0;
      const bTime = parseDate(b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    })
  ), [users]);

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) return sortedUsers;
    return sortedUsers.filter((u) =>
      [
        u.email,
        u.name,
        u.displayName,
        u.role,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, sortedUsers]);

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageUsers = filteredUsers.slice(startIndex, endIndex);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage users and view their uploaded properties</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <Users className="w-4 h-4 text-brand-500" />
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
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

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl px-5 py-4 mb-6 text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-100 rounded-full w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : pageUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? `No results for "${searchQuery}"` : 'No users yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Users will appear here after they sign up.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-semibold">User</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Role</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Created</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Last Login</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-semibold">
                            {(u.displayName || u.email || 'U')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-gray-900 font-semibold">{u.displayName || '--'}</div>
                            <div className="text-xs text-gray-500">{u.email || '--'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          u.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5 text-gray-600">{formatDate(u.lastLoginAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {pageUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm">
                        {(u.displayName || u.email || 'U')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-gray-900 font-bold">{u.displayName || '--'}</div>
                        <div className="text-xs text-gray-500">{u.email || '--'}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-gray-400 font-bold uppercase tracking-widest mb-0.5 text-[9px]">Created</div>
                      <div className="text-gray-700 font-medium">{formatDate(u.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 font-bold uppercase tracking-widest mb-0.5 text-[9px]">Last Login</div>
                      <div className="text-gray-700 font-medium">{formatDate(u.lastLoginAt)}</div>
                    </div>
                  </div>

                  <Link
                    to={`/admin/users/${u.id}`}
                    className="w-full flex items-center justify-center py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100"
                  >
                    View Details
                  </Link>
                </div>
              ))}
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
                ? `Showing ${filteredUsers.length} result${filteredUsers.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `Page ${safePage} of ${totalPages} - ${filteredUsers.length} total`
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
