import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header/Header.jsx';

export default function AccountPage() {
  const { currentUser, logout, changePassword, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

          <div className="mt-8 space-y-6">
            <div className={cardClass}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                Profile
              </span>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Profile Information</h2>
              <p className="mt-2 text-sm text-gray-600 text-pretty">
                Keep your contact details up to date for a personalized experience.
              </p>

              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={currentUser?.email || ''}
                    disabled
                    className={`${inputClass} bg-gray-50 text-gray-500`}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className={cardClass}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                Security
              </span>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Change Password</h2>
              <p className="mt-2 text-sm text-gray-600 text-pretty">
                Use a strong password to keep your account safe.
              </p>

              <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            <div className={cardClass}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                Sign Out
              </span>
              <h2 className="mt-3 text-xl font-bold text-gray-900">End your session</h2>
              <p className="mt-2 text-sm text-gray-600 text-pretty">
                Log out of your account on this device.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-xl border border-error-500/30 text-error-500 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-error-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
