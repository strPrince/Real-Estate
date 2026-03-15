import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminResetPasswordPage() {
  const { currentUser, changePassword, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if ((!currentUser && !email) || !oldPass || !newPass || !confirmPass) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPass.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('New password and confirm password do not match');
      return;
    }
    setSaving(true);
    try {
      if (currentUser) {
        await changePassword(oldPass, newPass);
        toast.success('Password updated successfully');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
        navigate('/admin/dashboard');
      } else {
        await login(email, oldPass);
        await changePassword(oldPass, newPass);
        await logout();
        toast.success('Password updated. Please log in.');
        setEmail('');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
        navigate('/admin/login');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {currentUser && (
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reset Admin Password</h1>
              <p className="text-gray-500 text-sm">Use your current password to set a new one</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!currentUser && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                autoComplete="email"
              />
            )}
            <input
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Current password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              autoComplete="current-password"
            />
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              autoComplete="new-password"
            />
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
