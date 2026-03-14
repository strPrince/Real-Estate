import React from 'react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import lvp from '../../assets/lvp.png';
import {
  Landmark, GraduationCap, TrendingUp, IndianRupee, Building2,
  MapPin, Star, ArrowRight, Train, TreePine, Shield, Zap
} from 'lucide-react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

const LAXMI_VILAS = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Laxmi_Vilas_Palace%2C_Vadodara.jpg/1280px-Laxmi_Vilas_Palace%2C_Vadodara.jpg';

const reasons = [
  {
    icon: Landmark,
    title: 'Rich Cultural Heritage',
    desc: 'Vadodara, the cultural capital of Gujarat, is home to the iconic Laxmi Vilas Palace, Baroda Museum, Sayaji Baug, and dozens of centuries-old temples and art galleries that give the city a unique, vibrant character.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: GraduationCap,
    title: 'Top Educational Institutions',
    desc: 'The city hosts the prestigious Maharaja Sayajirao University, Baroda Medical College, and 200+ schools — making it a preferred destination for families seeking quality education.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: TrendingUp,
    title: 'Booming Real Estate Market',
    desc: 'With 8–12% annual appreciation in key micro-markets like Waghodia Road, Gotri, and Alkapuri, Vadodara consistently outperforms tier-2 city averages, offering excellent ROI for property investors.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: IndianRupee,
    title: 'Affordable Cost of Living',
    desc: 'Compared to Ahmedabad and Surat, Vadodara offers a 30–40% lower cost of living with equally high quality. Land prices and rental yields remain investor-friendly without compromising lifestyle.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'World-Class Infrastructure',
    desc: 'The BRTS rapid transit system, under-construction Metro Rail, six-lane city ring road, Vadodara International Airport, and the upcoming Delhi-Mumbai Industrial Corridor node boost connectivity enormously.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: TreePine,
    title: 'Green & Liveable City',
    desc: 'Vadodara ranks among India\'s top 10 cleanest cities. With 1,000+ parks, Ajwa Water Park, Vishwamitri River promenade, and 35% green cover, it is designed for healthy urban living.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Building2,
    title: 'Thriving Industrial Economy',
    desc: 'Home to giants like GSFC, ONGC, ABB, Alstom, and Bombardier, Vadodara\'s GIDC industrial zones provide stable employment, fuelling consistent demand for both residential and commercial properties.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Safe & Secure City',
    desc: 'Vadodara consistently ranks among Gujarat\'s safest cities with low crime index, well-lit public spaces, and strong community policing — giving homeowners and families peace of mind.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Train,
    title: 'Strategic Location',
    desc: 'Perfectly positioned on NH-48 and the Mumbai-Delhi rail corridor, Vadodara sits just 2 hrs from Ahmedabad, 5 hrs from Mumbai, and 1.5 hrs from Surat — ideal for business travellers and commuters.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

const stats = [
  { value: '21L+', label: 'City Population', sub: 'Fastest growing tier-2' },
  { value: '₹4,200', label: 'Avg. Price / sq.ft', sub: 'Residential 2025' },
  { value: '10%', label: 'Annual Appreciation', sub: 'Top micro-markets' },
  { value: '#3', label: 'Gujarat City Rank', sub: 'By GDP contribution' },
];

export default function WhyVadodaraPage() {
  const shouldReduceMotion = false; // useReducedMotion();

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
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      };

  const hoverLift = shouldReduceMotion
    ? {}
    : {
        whileHover: { y: -4, scale: 1.005 },
        whileTap: { scale: 0.995 },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      };

  React.useEffect(() => {
    document.title = 'Why Vadodara? — Property Master Vadodara';
    const desc = 'Discover why Vadodara is the ideal city for property investment and living with Property Master Vadodara.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
  }, []);

  return (
    <>
      <Header />

      <LazyMotion features={domAnimation}>
        <m.div {...pageMotion}>
      {/* ── HERO — split image + city text on dark bg ── */}
      <m.section {...reveal} className="relative w-full overflow-hidden bg-gray-900 pt-16 sm:pt-20 pb-28">
        {/* glow blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-32 left-10 w-64 h-64 bg-brand-300 rounded-full opacity-10 blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT — text */}
            <div className="space-y-5 order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/50 text-brand-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" /> Discover Vadodara
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15]">
                Why Invest in<br />
                <span className="text-brand-500">Vadodara?</span>
              </h1>
              <div className="w-12 h-1 bg-brand-500 rounded-full"></div>
              <p className="text-gray-200 leading-relaxed">
                Vadodara — also known as Baroda — is the Cultural Capital of Gujarat and one of India's
                most rapidly growing real estate destinations. Home to the majestic Laxmi Vilas Palace,
                four times larger than Buckingham Palace, the city blends centuries of royal heritage with
                cutting-edge modern infrastructure.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Today, Vadodara is transforming into a major economic hub — with a diverse industrial base,
                thriving IT sector, world-class educational institutions, and a rapidly growing population of
                young professionals, all fuelling extraordinary demand for quality real estate.
              </p>

              {/* Quick highlights */}
              <ul className="space-y-2 pt-1">
                {[
                  'Cultural capital of Gujarat with royal heritage',
                  'Consistent 8–12% annual property appreciation',
                  'Tier-2 city with tier-1 infrastructure',
                  'Affordable land prices — great ROI',
                ].map((point) => (
                  <li key={point} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <m.div {...hoverLift} className="inline-flex">
                  <a
                    href="/properties"
                    className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
                  >
                    Explore Properties <ArrowRight className="w-4 h-4" />
                  </a>
                </m.div>
                <m.div {...hoverLift} className="inline-flex">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-brand-500/40 text-brand-100 font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
                  >
                    Talk to Us
                  </a>
                </m.div>
              </div>
            </div>

            {/* RIGHT — image */}
            <m.div {...hoverLift} className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 order-1 lg:order-2">
              <img
                src={LAXMI_VILAS}
                alt="Laxmi Vilas Palace, Vadodara"
                className="w-full h-80 sm:h-96 lg:h-120 object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-gray-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white">
                  <p className="font-bold text-base">Laxmi Vilas Palace</p>
                  <p className="text-sm text-gray-300">Vadodara — 4× larger than Buckingham Palace</p>
                </div>
              </div>
            </m.div>

          </div>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1440 80" className="w-full h-20" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </m.section>

      <main className="relative bg-gray-50 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-brand-100 rounded-full opacity-40 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/2 -right-16 w-52 h-52 bg-brand-200 rounded-full opacity-20 blur-3xl"></div>

        {/* ── STATS STRIP ── */}
        <m.section {...reveal} className="bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {stats.map(({ value, label, sub }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-brand-500">{value}</p>
                  <p className="text-white font-semibold mt-1">{label}</p>
                  <p className="text-brand-200 text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </m.section>

        {/* ── REASONS GRID ── */}
        <m.section {...reveal} className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                <Star className="w-3.5 h-3.5" /> 9 Compelling Reasons
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Why Vadodara is Your Best Investment Choice
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map(({ icon: Icon, title, desc, color, bg }, index) => (
                <m.article
                  key={title}
                  {...hoverLift}
                  className="group relative"
                >
                  <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[28px] bg-brand-500/10"></div>
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-brand-500/10 blur-2xl"></div>

                  <div className="relative rounded-[28px] border border-gray-200 bg-white/85 backdrop-blur p-6 sm:p-7 overflow-hidden shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
                    <div className="absolute -right-8 top-6 rotate-12 rounded-full border border-dashed border-gray-300 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-gray-400">
                      Reason {String(index + 1).padStart(2, '0')}
                    </div>

                    <svg
                      className="absolute -right-10 -bottom-10 h-44 w-44 text-gray-200 opacity-70"
                      viewBox="0 0 200 200"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M20 150 C 60 90, 140 90, 180 150" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
                      <path d="M30 50 C 80 20, 120 20, 170 50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
                      <circle cx="40" cy="150" r="6" fill="currentColor" />
                      <circle cx="160" cy="50" r="5" fill="currentColor" />
                    </svg>

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`absolute -inset-2 rounded-2xl ${bg} opacity-50 blur-sm`}></div>
                          <div className={`relative w-12 h-12 rounded-2xl ${bg} flex items-center justify-center border border-white shadow-sm`}>
                            <Icon className={`w-6 h-6 ${color}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">Reason</p>
                          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        </div>
                      </div>
                      <span className="text-3xl font-extrabold text-gray-200">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <p className="mt-4 text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>

                  <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border border-gray-200"></span>
                  <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border border-gray-200"></span>
                </m.article>
              ))}
            </div>
          </div>
        </m.section>

        {/* ── INVESTMENT CTA ── */}
        <m.section {...reveal} className="relative py-20 bg-gray-900 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 bg-brand-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-64 h-64 bg-brand-300 rounded-full opacity-10 blur-3xl"></div>
          <div className="relative max-w-3xl mx-auto text-center px-4">
            <div className="w-14 h-14 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
              Ready to Invest in Vadodara?
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              With rising infrastructure, growing demand, and consistently appreciating property values,
              there has never been a better time to invest in Vadodara real estate. Let Property Master Vadodara
              guide you to the right property at the right price.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <m.div {...hoverLift} className="inline-flex">
                <a
                  href="/properties"
                  className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200"
                >
                  Browse Properties <ArrowRight className="w-4 h-4" />
                </a>
              </m.div>
              <m.div {...hoverLift} className="inline-flex">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200"
                >
                  Talk to Us
                </a>
              </m.div>
            </div>
          </div>
        </m.section>

        {/* ── PHOTO CALLOUT ── */}
        <m.section {...reveal} className="relative overflow-hidden">
          <img
            src={lvp}
            alt="Vadodara — Laxmi Vilas Palace"
            className="w-full h-100 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
            <div className="max-w-2xl text-center px-4">
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Vadodara Real Estate</p>
              <blockquote className="text-white text-2xl sm:text-3xl font-extrabold leading-snug mb-6">
                "Vadodara is not just a place to live — it's a place to grow, invest, and thrive."
              </blockquote>
              <p className="text-gray-300">— Vasudha Thakur, Property Master Vadodara</p>
            </div>
          </div>
        </m.section>

        {/* bottom wave */}
        <div className="bg-gray-900">
          <svg viewBox="0 0 1440 60" className="w-full h-16 block" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>

      </main>
        </m.div>
      </LazyMotion>
      <Footer />
    </>
  );
}
