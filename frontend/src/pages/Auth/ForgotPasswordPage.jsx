import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header/Header.jsx';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const inputClass =
    'mt-2 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-50';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success('If an account exists, a reset link has been generated. Check the server console (simulating email).');
      setEmail('');
    } catch (error) {
      toast.error('Failed to submit request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                Reset Password
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
                Forgot your password?
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-pretty">
                Enter your email address and we will send you a link to reset your password.
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

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600 text-center">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-accent-500 hover:text-accent-600">
                Back to sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
