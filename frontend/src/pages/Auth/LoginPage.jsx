import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header/Header.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const inputClass =
    'mt-2 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-50';

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/account'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/account');
      }
    } catch (error) {
      toast.error('Failed to log in: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-stretch">
            <div className="relative rounded-4xl overflow-hidden bg-gray-900 p-8 sm:p-10 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[28px_28px] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-brand-500/60" />
              <div className="relative space-y-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  Member Access
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-balance">
                  Welcome back to Property Master
                </h1>
                <p className="text-gray-300 text-pretty">
                  Sign in to manage your listings, track saved properties, and get personalized recommendations for Vadodara real estate.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  {[
                    'Saved searches and instant alerts',
                    'Your listings and inquiries in one place',
                    'Faster access to account settings',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-200 hover:text-white transition-colors"
                  >
                    New here? Create an account
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                  Sign In
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-pretty">
                  Use the email address you registered with to continue.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link to="/forgot-password" className="font-semibold text-accent-500 hover:text-accent-600">
                    Forgot your password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-600">
                New to Property Master?{' '}
                <Link to="/signup" className="font-semibold text-accent-500 hover:text-accent-600">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
