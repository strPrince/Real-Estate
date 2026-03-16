import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutDashboard, PlusCircle, LogOut, Menu, X, ShieldCheck, KeyRound, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../property-master.png';

export default function AdminLayout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/admin/login');
    } catch {
      toast.error('Logout failed');
    }
  }

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', Icon: Users },
    { to: '/admin/properties/new', label: 'Add Listing', Icon: PlusCircle },
    { to: '/admin/reset-password', label: 'Reset Password', Icon: KeyRound },
  ];

  return (
    <div className="h-screen bg-[#F5F2EE] flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'fixed' : 'lg:sticky'
        } top-0 left-0 z-50 h-screen w-64 bg-[#0F172A] border-r border-white/10 shadow-[0_25px_60px_-30px_rgba(2,6,23,0.75)] flex flex-col lg:self-start ${sidebarOpen ? 'transform transition-transform duration-300 ease-in-out' : 'lg:transform-none'} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center ring-1 ring-white/15">
              <img src={logo} alt="Property Master" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none tracking-wide">Property Master</div>
              <div className="text-[10px] text-white/60 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Admin Panel
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-5 px-3 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-3 mb-2">Navigation</p>
          <ul className="space-y-1">
            {links.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-white/10 text-white shadow-[0_12px_24px_-16px_rgba(0,0,0,0.6)] ring-1 ring-white/10' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User + logout */}
        <div className="shrink-0 p-4 border-t border-white/10 bg-[#0B1324]">
          {currentUser && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 font-semibold text-brand-200 text-sm">
                {currentUser.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white/90 truncate">{currentUser.email}</div>
                <div className="text-[10px] text-white/50">Administrator</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-200 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar for mobile */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="text-gray-700 hover:bg-gray-100 rounded-lg p-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
