import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Home, Eye, EyeOff, Building2, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../property-master.png';

export default function AdminLoginPage() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in
  if (currentUser) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-brand-400 rounded-full opacity-10 blur-3xl" />
      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Card header band */}
          <div className="bg-linear-to-r from-brand-600 to-brand-700 px-8 py-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl bg-transparent mb-3">
              {/* logo replaces shield icon; size bumped up */}
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-white text-sm mt-1">Property Master Vadodara</p>
          </div>

          <div className="px-8 py-7 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center">
              <Link to="/admin/reset-password" className="text-sm text-brand-600 hover:text-brand-700 font-semibold">
                Reset password (requires current password)
              </Link>
            </div>

            <div className="flex items-center gap-2 justify-center text-xs text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure admin access · Data is protected
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-5">
          © {new Date().getFullYear()} Property Master Vadodara
        </p>
      </div>
    </div>
  );
}
