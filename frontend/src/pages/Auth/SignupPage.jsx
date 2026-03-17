import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '../../property-master.png';

export default function SignupPage() {
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirm]       = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);
  const [loading, setLoading]               = useState(false);
  const { signup, currentUser }             = useAuth();
  const navigate                            = useNavigate();

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/account'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6)          return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await signup(email, password, name);
      toast.success('Account created!');
      navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/account');
    } catch (err) {
      toast.error('Failed to create account: ' + err.message);
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

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-sub">Join thousands discovering Vadodara real estate</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <label htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Min. 6 characters"
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

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPw ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account…</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
