import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, ChevronUp } from 'lucide-react';
import logo from '../../property-master.png';
import buildings from '../../assets/buildings.png';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300 pt-20 pb-0 rounded-t-4xl shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.8)]">
      <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-gray-50/0 to-slate-950/90 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-brand-500/70" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-200">
                Start Here
              </span>
              <h3 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
                Find your next home in Vadodara with confidence.
              </h3>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Verified listings, local expertise, and a transparent process from shortlist to registration.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(255,122,0,0.6)] hover:bg-brand-600 transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/90 hover:border-brand-400 hover:text-white transition-colors"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logo}
                alt="Property Master"
                className="w-50 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 text-pretty">
              Vadodara's trusted platform to buy, rent, and discover your perfect property.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={label}
                  className="p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-brand-500 hover:border-brand-500 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-slate-300 hover:text-white transition-colors duration-200" />
                </a>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] uppercase tracking-[0.26em] text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center">
                12+ years
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center">
                30k+ clients
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-display font-semibold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Buy Property', to: '/properties?intent=buy' },
                { label: 'Rent Property', to: '/properties?intent=rent' },
                { label: 'All Listings', to: '/properties' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'About Us', to: '/about' },
                { label: 'Why Vadodara', to: '/why-vadodara' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-300 transition-colors duration-200 group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display font-semibold mb-6 text-lg">Property Types</h3>
            <ul className="space-y-3 text-sm">
              {['Residential', 'Commercial', 'Plot / Land', 'PG / Rentals'].map((t) => (
                <li key={t}>
                  <Link
                    to={`/properties?type=${t.toLowerCase().split(' ')[0]}`}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-300 transition-colors duration-200 group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {t}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display font-semibold mb-6 text-lg">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3 items-start">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <MapPin className="w-4 h-4 text-brand-400" />
                </span>
                <span className="leading-relaxed">Vadodara, Gujarat, India</span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Phone className="w-4 h-4 text-brand-400" />
                </span>
                <a href="tel:+919876543210" className="hover:text-brand-300 transition-colors duration-200">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Mail className="w-4 h-4 text-brand-400" />
                </span>
                <a href="mailto:info@propertymaster.com" className="hover:text-brand-300 transition-colors duration-200">
                  info@propertymaster.com
                </a>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
              Mon - Sat: 9:00 AM to 8:00 PM
            </div>
          </div>
        </div>

        <div className="relative mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              {'\u00A9'} {new Date().getFullYear()} Property Master. All rights reserved. |
              <Link to="/terms" className="text-slate-400 hover:text-brand-300 transition-colors duration-200 ml-1">
                Terms of Service
              </Link>{' '}
              |
              <Link to="/policy" className="text-slate-400 hover:text-brand-300 transition-colors duration-200 ml-1">
                Privacy Policy
              </Link>
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-slate-400 hover:text-brand-300 transition-colors duration-200 group"
            >
              <ChevronUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform duration-200" />
              <span className="text-xs font-medium">Back to top</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none flex justify-center">
        <img
          src={buildings}
          alt="Buildings"
          className="w-full max-w-6xl h-auto opacity-20 object-cover"
        />
      </div>
    </footer>
  );
}
