import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header/Header.jsx';
import { User, ShieldCheck, LogOut, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AccountPage() {
  const { currentUser, logout, changePassword, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setName(currentUser?.displayName || currentUser?.name || '');
  }, [currentUser]);

  const inputClass =
    'mt-2 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-50';

  const cardClass =
    'bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)]';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(name);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
    }

    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password: ' + error.message);
    }

    setLoading(false);
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
            Account
          </span>
          <div className="mt-3 flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">Your Account</h1>
            <p className="text-sm sm:text-base text-gray-600 text-pretty">
              Manage your profile details and keep your account secure.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className={`${cardClass} h-full`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  <p className="text-xs text-gray-500">Manage your personal details</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={currentUser?.email || ''}
                    disabled
                    className={`${inputClass} bg-gray-50 text-gray-500 border-dashed cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your name"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>

            <div className={`${cardClass} h-full`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-xs text-gray-500">Keep your account safe</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label htmlFor="oldPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPw ? 'text' : 'password'}
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                      aria-label={showOldPw ? 'Hide password' : 'Show password'}
                    >
                      {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <Lock className="w-4 h-4 text-gray-400" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${inputClass} pr-12`}
                        placeholder="••••••••"
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
                    <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                      <Lock className="w-4 h-4 text-gray-400" />
                      Confirm New
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-12`}
                        placeholder="••••••••"
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>

            <div className={`${cardClass} md:col-span-2 border-red-100 bg-red-50/10`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Sign Out</h2>
                    <p className="text-sm text-gray-500">End your current session on this device</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-red-500 text-red-500 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
