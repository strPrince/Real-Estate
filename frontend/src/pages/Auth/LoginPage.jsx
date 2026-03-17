import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '../../property-master.png';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login, currentUser }  = useAuth();
  const navigate                = useNavigate();

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/account'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Logged in successfully!');
      navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/account');
    } catch (err) {
      toast.error('Failed to log in: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-bg">
      {/* ── decorative blobs ── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ── floating grid lines ── */}
      <div className="auth-grid" />

      {/* ── card ── */}
      <div className="auth-card">
        {/* logo / wordmark */}
        <div className="flex justify-center mb-2">
          <Link to="/" className="hover:scale-105 transition-transform duration-300">
            <img src={logo} alt="Property Master" className="w-32 h-32 object-contain" />
          </Link>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue to your account</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-link-small">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
