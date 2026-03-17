import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header/Header.jsx';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid or missing reset token.');
    }
  }, [token, email]);

  const inputClass =
    'mt-2 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-50';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error('Invalid reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, token, newPassword);
      toast.success('Password successfully reset! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to reset password: ' + error.message);
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
                Set New Password
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
                Create a new password
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-pretty">
                Please enter your new password below.
              </p>
            </div>

            {!token || !email ? (
              <div className="text-center">
                <p className="text-red-500 font-medium mb-4">Invalid or missing reset link.</p>
                <Link to="/forgot-password" className="font-semibold text-brand-500 hover:text-brand-600">
                  Request a new link
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                      aria-label={showNewPw ? 'Hide password' : 'Show password'}
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPw ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                      aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
