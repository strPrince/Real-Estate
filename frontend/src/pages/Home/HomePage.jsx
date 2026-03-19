import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import Hero from '../../components/Hero/Hero.jsx';
import FeaturedPropertyPreview from '../../components/FeaturedPropertyPreview/FeaturedPropertyPreview.jsx';
import Features from '../../components/Features/Features.jsx';
import Testimonials from '../../components/Testimonials/Testimonials.jsx';
import EmiCalculator from '../../components/EmiCalculator/EmiCalculator.jsx';
import FAQ from '../../components/FAQ/FAQ.jsx';
import LocalityMap from '../../components/LocalityMap/LocalityMap.jsx';
import { getProperties, getLocalities } from '../../api.js';
import { Link } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import localities from '../../data/localities.json';
import { Home, Building2, Award } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard/PropertyCard.jsx';
import Vadodara1 from '../../assets/Vadodara1.png';
import Vadodara2 from '../../assets/Vadodara2.png';
import Vadodara3 from '../../assets/Vadodara3.png';
import lvp from '../../assets/lvp.png';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [localityOptions, setLocalityOptions] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [localityProperties, setLocalityProperties] = useState([]);
  const [localityLoading, setLocalityLoading] = useState(false);
  const [localityError, setLocalityError] = useState('');
  const shouldReduceMotion = false; // useReducedMotion();

  const localityStats = useMemo(() => {
    if (!localities.length) return null;
    const toNum = (value) => {
      const n = parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);
      return Number.isFinite(n) ? n : 0;
    };
    const totals = localities.map((l) => toNum(l.properties));
    const totalListings = totals.reduce((acc, v) => acc + v, 0);
    const top = localities.reduce((a, b) => (toNum(a.properties) > toNum(b.properties) ? a : b), localities[0]);
    return {
      totalListings,
      topLocality: top?.name,
      premiumCount: localities.filter((l) => l.type?.toLowerCase() === 'premium').length,
    };
  }, []);

  const pageMotion = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    };

  const reveal = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    };

  const hoverLift = shouldReduceMotion
    ? {}
    : {
      whileHover: { y: -3, scale: 1.005 },
      whileTap: { scale: 0.995 },
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    };

  useEffect(() => {
    document.title = 'Property Master Vadodara - Find Your Dream Property';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Discover top properties for sale and rent in Vadodara with Property Master Vadodara. Browse featured listings and get personalized assistance.');
    }
    setLoading(true);
    const limit = currentUser ? 6 : 3;
    getProperties({ featured: true, limit })
      .then((data) => setFeatured(data.properties || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    getLocalities()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const names = list.map((loc) => loc.name).filter(Boolean);
        if (names.length) {
          setLocalityOptions(names);
          setSelectedLocality((prev) => prev || names[0]);
        } else {
          const fallbackNames = (localities || []).map((loc) => loc.name).filter(Boolean);
          setLocalityOptions(fallbackNames);
          setSelectedLocality((prev) => prev || fallbackNames[0] || '');
        }
      })
      .catch(() => {
        if (!active) return;
        const fallbackNames = (localities || []).map((loc) => loc.name).filter(Boolean);
        setLocalityOptions(fallbackNames);
        setSelectedLocality((prev) => prev || fallbackNames[0] || '');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!selectedLocality) {
      setLocalityProperties([]);
      return () => { active = false; };
    }
    setLocalityLoading(true);
    setLocalityError('');
    getProperties({ q: selectedLocality, limit: 3 })
      .then((data) => {
        if (!active) return;
        setLocalityProperties(data.properties || []);
      })
      .catch(() => {
        if (!active) return;
        setLocalityError('Could not load locality listings.');
        setLocalityProperties([]);
      })
      .finally(() => {
        if (active) setLocalityLoading(false);
      });
    return () => { active = false; };
  }, [selectedLocality]);

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.main {...pageMotion}>
          <m.div {...reveal}>
            <Hero />
          </m.div>

          {/* Trust strip */}
          <m.section {...reveal} className="bg-white/80 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                {[
                  { title: 'Verified Listings', desc: 'Only screened properties & builders' },
                  { title: 'Transparent Pricing', desc: 'No hidden surprises, ever' },
                  { title: 'Local Experts', desc: 'Vadodara specialists at every step' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                    <div>
                      <div className="text-gray-900 font-semibold">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </m.section>

          <m.div {...reveal}>
            <FeaturedPropertyPreview properties={featured} loading={loading} />
          </m.div>

          {/* Locality Picks */}
          <m.section {...reveal} className="py-12 sm:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                    Locality Picks
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                    Explore listings by locality
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 text-pretty max-w-2xl">
                    Select a locality to see the latest listings. Use View More to browse all matching properties.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Choose locality
                  </label>
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full sm:w-72 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white"
                  >
                    {localityOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {localityError && (
                <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {localityError}
                </div>
              )}

              {localityLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : localityProperties.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl text-gray-500">
                  No listings found for {selectedLocality || 'this locality'}.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localityProperties.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Link
                      to={selectedLocality ? `/properties?q=${encodeURIComponent(selectedLocality)}` : '/properties'}
                      className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]"
                    >
                      View more in {selectedLocality || 'all areas'}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </m.section>

          <m.div {...reveal}>
            <Features />
          </m.div>

          {/* Welcome Section */}
          <m.section {...reveal} className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-4xl bg-white border border-gray-200 shadow-[0_24px_60px_-22px_rgba(15,23,42,0.2)]">
                {/* Background elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -left-24 top-10 h-72 w-72 rounded-full border border-gray-200/70" />
                  <div className="absolute left-10 top-24 h-40 w-40 rounded-full border border-gray-200/70" />
                  <div className="absolute right-10 bottom-10 h-44 w-44 rounded-full border border-gray-200/70" />
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-gray-200/70" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.7)_0%,rgba(248,250,252,0.7)_50%,transparent_50%,transparent_100%)] opacity-50" />
                </div>
                <div className="absolute inset-x-0 top-0 h-px bg-brand-500/60" />

                {/* Creative Floating Element - Top Right */}
                <div className="absolute right-0 top-0 hidden lg:block pointer-events-none pr-12 pt-12">
                  <m.div
                    animate={{ 
                      y: [0, -12, 0],
                      scale: [1, 1.03, 1]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <div className="absolute -inset-6 bg-brand-500/5 rounded-full blur-2xl" />
                    <div className="relative bg-white/80 backdrop-blur-sm border border-brand-50/50 p-6 rounded-[2.5rem] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.1)] flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-3xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                        <Award className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-500">Excellence</div>
                        <div className="text-xs font-semibold text-gray-900 mt-1">Vadodara's Top Choice</div>
                      </div>
                      {/* Decorative accents */}
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-1 w-1 rounded-full bg-brand-200" />
                        ))}
                      </div>
                    </div>
                  </m.div>
                </div>

                <div className="relative p-8 sm:p-12">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                      Welcome
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                      Welcome to Property Master
                    </h2>
                    <p className="mt-3 text-gray-500 leading-relaxed text-pretty">
                      Your local experts for Vadodara properties. We curate listings, verify builders, and guide you through
                      every step with clear updates and practical advice.
                    </p>
                  </div>

                  <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
                    {/* Visual */}
                    <div className="relative flex items-center justify-center">
                      <div
                        className="relative h-[360px] w-[320px] sm:h-[420px] sm:w-[360px] bg-cover bg-center shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)]"
                        style={{
                          backgroundImage:
                            "url('https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80')",
                          clipPath:
                            'polygon(50% 0%, 100% 18%, 100% 85%, 80% 100%, 20% 100%, 0% 85%, 0% 18%)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                      </div>

                      <div className="absolute right-10 top-12 h-24 w-24 rounded-full bg-brand-500 text-white flex flex-col items-center justify-center text-[11px] font-semibold shadow-[0_18px_40px_-12px_rgba(255,122,0,0.6)]">
                        <span className="text-[10px] tracking-[0.2em] uppercase">Know</span>
                        <span className="text-lg font-bold leading-none">More</span>
                      </div>

                      <div className="absolute -right-4 bottom-6 bg-white/90 backdrop-blur-sm border border-white/70 rounded-2xl px-4 py-3 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)]">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.2em]">
                          Trusted
                        </div>
                        <div className="text-lg font-bold text-gray-900">12+ Years</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
                        What you get
                      </div>
                      <ul className="mt-4 space-y-3 text-base text-gray-600">
                        <li className="flex items-start gap-2 italic">
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                          Proactive shortlisting based on budget and lifestyle.
                        </li>
                        <li className="flex items-start gap-2 italic">
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                          Transparent pricing insights and neighborhood guidance.
                        </li>
                        <li className="flex items-start gap-2 italic">
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                          On-ground support from visit to documentation.
                        </li>
                        <li className="flex items-start gap-2 italic">
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                          Exclusive access to pre-launch projects and prime deals.
                        </li>
                        <li className="flex items-start gap-2 italic">
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                          Expertise in legal verification and seamless registration.
                        </li>
                        <li className="flex items-start gap-2 italic">
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                          Tailored investment plans with high ROI potential.
                        </li>
                      </ul>

                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        <m.div {...hoverLift} className="inline-flex">
                          <Link
                            to="/properties"
                            className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]"
                          >
                            Explore More
                          </Link>
                        </m.div>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full border border-gray-200 bg-white/70 flex flex-col items-center justify-center text-[11px] font-semibold text-gray-700">
                            30k+
                            <span className="text-[9px] font-medium text-gray-400">Clients</span>
                          </div>
                          <div className="h-12 w-12 rounded-full border border-gray-200 bg-white/70 flex flex-col items-center justify-center text-[11px] font-semibold text-gray-700">
                            700+
                            <span className="text-[9px] font-medium text-gray-400">Homes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.section>

          {/* Localities Showcase */}
          <m.section {...reveal} className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                  Localities
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                  Locality map of Vadodara
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-pretty max-w-2xl">
                  Pinpoint the neighborhoods that match your lifestyle and explore listings with local insights.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
                <LocalityMap />
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
                    Locality stats
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total listings</span>
                      <span className="text-lg font-bold text-gray-900">
                        {localityStats?.totalListings ? `${localityStats.totalListings}+` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Top demand</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {localityStats?.topLocality || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Premium zones</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {localityStats?.premiumCount ?? '—'}
                      </span>
                    </div>
                    <div className="mt-4 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-xs text-brand-700">
                      Tip: Click a pin to see locality details and listing volume.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.section>


          <m.div {...reveal}>
            <EmiCalculator headerVariant="outer" />
          </m.div>

          {/* Why Choose Vadodara */}
          <m.section {...reveal} className="py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  Why Vadodara
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">
                  Why Choose Vadodara for Property?
                </h2>
              </div>
              <div className="relative rounded-4xl overflow-hidden bg-gray-900/80 border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
                {/* Dot-matrix texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[28px_28px] pointer-events-none" />
                {/* Top brand accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-brand-500/60" />
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 sm:p-12">
                  <div className="space-y-5">
                    <p className="text-gray-400 text-base leading-relaxed max-w-xl">
                      Vadodara, the cultural capital of Gujarat, offers a perfect blend of rich heritage and modern infrastructure.
                      With consistent property appreciation, affordable prices, top educational institutions, and a thriving economy,
                      it's the ideal destination for both homebuyers and investors.
                    </p>
                    <p className="text-gray-400 text-base leading-relaxed max-w-xl">
                      From luxurious apartments in Alkapuri to affordable homes in Gotri, Vadodara has something for everyone.
                      Discover why thousands of property seekers are choosing Vadodara as their new home.
                    </p>
                    <m.div {...hoverLift} className="inline-flex">
                      <Link
                        to="/why-vadodara"
                        className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-[0_4px_14px_0_rgba(255,122,0,0.35)]"
                      >
                        Learn More About Vadodara
                      </Link>
                    </m.div>
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
                          <img
                            src={lvp}
                            alt="Laxmi Vilas Palace"
                            className="h-36 sm:h-40 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
                          <img
                            src={Vadodara1}
                            alt="Vadodara Skyline"
                            className="h-44 sm:h-48 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <div className="space-y-4 pt-6">
                        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
                          <img
                            src={Vadodara2}
                            alt="Vadodara Streets"
                            className="h-40 sm:h-44 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
                          <img
                            src={Vadodara3}
                            alt="Vadodara Modern Buildings"
                            className="h-36 sm:h-40 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.section>

          <m.div {...reveal}>
            <Testimonials />
          </m.div>
          <m.div {...reveal}>
            <FAQ />
          </m.div>
        </m.main>
      </LazyMotion>
      <Footer />
    </>
  );
}
