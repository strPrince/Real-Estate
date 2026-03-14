import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import logo from '../../property-master.png';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'All Properties', to: '/properties' },
    { label: 'Contact', to: '/contact' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle about us dropdown
      const aboutDropdown = document.querySelector('.navbar-dropdown');
      const aboutDropdownButton = document.querySelector('.dropdown-button');
      
      if (aboutDropdown && aboutDropdownButton && !aboutDropdown.contains(event.target) && !aboutDropdownButton.contains(event.target)) {
        setDropdownOpen(false);
      }
      
      // Handle user dropdown
      const userDropdown = document.querySelector('.user-dropdown');
      const userDropdownButton = document.querySelector('.user-dropdown-button');
      
      if (userDropdown && userDropdownButton && !userDropdown.contains(event.target) && !userDropdownButton.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!open);
    }
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
          <img 
            src={logo} 
            alt="Property Master" 
            className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-contain group-hover:scale-110 transition-transform duration-300" 
            width="128" 
            height="128" 
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative group text-sm font-semibold px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-[color,transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)] ${
                  active ? 'text-white' : 'text-gray-300'
                }`}
              >
                {l.label}
                <span className={`pointer-events-none absolute inset-x-2 bottom-1 h-px bg-brand-500 transition-transform duration-300 ease-out ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'}`} />
                <span className="pointer-events-none absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
              </Link>
            );
          })}
          
          {/* About Us Dropdown */}
          <div className="relative navbar-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative group flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-[color,transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:text-white hover:shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)] text-gray-300 dropdown-button"
            >
              About Us
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-out ${dropdownOpen ? 'rotate-180' : ''}`} />
              <span className="pointer-events-none absolute inset-x-2 bottom-1 h-px bg-brand-500 transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)] py-4 z-50 border border-gray-100 animate-in slide-in-from-top-2 fade-in duration-400">
                <Link
                  to="/about"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-5 py-3 text-sm text-gray-700 rounded-lg transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0" />
                    About
                  </span>
                  <span className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/10 group-hover:w-full transition-all duration-300" />
                </Link>
                <Link
                  to="/why-vadodara"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-5 py-3 text-sm text-gray-700 rounded-lg transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0" />
                    Why Vadodara?
                  </span>
                  <span className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <span className="absolute left-0 top-0 bottom-0 w-0 bg-accent-500/10 group-hover:w-full transition-all duration-300" />
                </Link>
              </div>
            )}
          </div>
          
          {/* User Authentication Links */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300 user-dropdown-button"
              >
                <User className="w-5 h-5" />
                <span>{currentUser.displayName || currentUser.email}</span>
              </button>
              
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)] py-2 z-50 border border-gray-100 animate-in slide-in-from-top-2 fade-in duration-400 user-dropdown">
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-5 py-3 text-sm text-gray-700 rounded-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0" />
                      Dashboard
                    </span>
                    <span className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/10 group-hover:w-full transition-all duration-300" />
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-5 py-3 text-sm text-gray-700 rounded-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0" />
                      Account Settings
                    </span>
                    <span className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/10 group-hover:w-full transition-all duration-300" />
                  </Link>
                  <Link
                    to="/post-property"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-5 py-3 text-sm text-gray-700 rounded-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0" />
                      Post Property
                    </span>
                    <span className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/10 group-hover:w-full transition-all duration-300" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="relative group bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] overflow-hidden"
              >
                <span className="relative z-10 group-hover:translate-x-1 transition-all duration-400">Sign Up</span>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-400" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-800" />
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button 
          className="md:hidden text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-2 transition-all duration-400 hover:bg-white/5 hover:text-brand-500 group relative"
          onClick={() => setOpen(!open)} 
          onKeyDown={handleMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-400" />
          {open ? <X className="w-6 h-6 relative z-10 transition-transform duration-400 rotate-90" /> : <Menu className="w-6 h-6 relative z-10 transition-transform duration-400" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-white/10 px-4 pb-6 space-y-3 animate-in slide-in-from-top-4 fade-in duration-500">
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block py-3 text-sm font-semibold rounded-lg px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all duration-400 relative overflow-hidden ${
                  active ? 'text-white bg-white/5' : 'text-gray-300'
                }`}
              >
                <span className="relative z-10">{l.label}</span>
                <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 hover:opacity-100 transition-all duration-400" />
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 hover:w-full transition-all duration-400" />
              </Link>
            );
          })}
          
          {/* Mobile About Us Menu */}
          <div className="space-y-2">
            <div className="py-3 text-gray-300 font-semibold text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              About Us
            </div>
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="block py-3 pl-6 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                About
              </span>
              <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 group-hover:w-full transition-all duration-400" />
            </Link>
            <Link
              to="/why-vadodara"
              onClick={() => setOpen(false)}
              className="block py-3 pl-6 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                Why Vadodara?
              </span>
              <span className="absolute left-0 top-0 bottom-0 w-0 bg-accent-500/20 group-hover:w-full transition-all duration-400" />
            </Link>
          </div>
          
          {currentUser ? (
            <div className="pt-4 border-t border-gray-700">
              <div className="py-2 text-gray-300 font-semibold text-sm">
                {currentUser.displayName || currentUser.email}
              </div>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block py-3 pl-6 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  Dashboard
                </span>
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 group-hover:w-full transition-all duration-400" />
              </Link>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="block py-3 pl-6 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  Account Settings
                </span>
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 group-hover:w-full transition-all duration-400" />
              </Link>
              <Link
                to="/post-property"
                onClick={() => setOpen(false)}
                className="block py-3 pl-6 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  Post Property
                </span>
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 group-hover:w-full transition-all duration-400" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  Login
                </span>
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 group-hover:w-full transition-all duration-400" />
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm text-gray-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-3 transition-all duration-400 hover:bg-white/5 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  Sign Up
                </span>
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-brand-500/20 group-hover:w-full transition-all duration-400" />
              </Link>
            </div>
          )}
          
          <button
            onClick={() => { setOpen(false); navigate('/properties'); }}
            className="w-full relative group bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-400 mt-4 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] overflow-hidden"
          >
            <span className="relative z-10 group-hover:translate-x-1 transition-all duration-400">Search Properties</span>
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-400" />
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-800" />
          </button>
        </div>
      )}
    </header>
  );
}
