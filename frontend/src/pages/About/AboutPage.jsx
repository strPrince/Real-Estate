import React from 'react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { Home, MapPin, DollarSign, Building2, Award, Target, TrendingUp, Users, Star, ShieldCheck, Headphones } from 'lucide-react';
import aboutimg from '../../assets/about.png';
import { LazyMotion, domAnimation, m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

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

  const [isCoarsePointer, setIsCoarsePointer] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsCoarsePointer(mediaQuery.matches);
    update();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const tiltEnabled = !shouldReduceMotion && !isCoarsePointer;

  const cardBase =
    'group relative h-full overflow-hidden rounded-[28px] border border-gray-200/80 bg-white p-8 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)] transition-shadow duration-300 hover:shadow-[0_26px_70px_-36px_rgba(15,23,42,0.55)] focus-within:ring-2 focus-within:ring-brand-500/25';

  const InteractiveCard = ({ children }) => {
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const baseScale = useMotionValue(1);

    const rotateX = useSpring(
      useTransform(pointerY, [-0.5, 0.5], [10, -10]),
      { stiffness: 160, damping: 18 }
    );
    const rotateY = useSpring(
      useTransform(pointerX, [-0.5, 0.5], [-10, 10]),
      { stiffness: 160, damping: 18 }
    );
    const scale = useSpring(baseScale, { stiffness: 180, damping: 20 });

    React.useEffect(() => {
      if (!tiltEnabled) {
        pointerX.set(0);
        pointerY.set(0);
        baseScale.set(1);
      }
    }, [tiltEnabled, pointerX, pointerY, baseScale]);

    const handlePointerMove = (event) => {
      if (!tiltEnabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      pointerX.set(x);
      pointerY.set(y);
      baseScale.set(1.02);
      event.currentTarget.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      event.currentTarget.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    };

    const handlePointerLeave = (event) => {
      if (!tiltEnabled) return;
      pointerX.set(0);
      pointerY.set(0);
      baseScale.set(1);
      event.currentTarget.style.setProperty('--mx', '50%');
      event.currentTarget.style.setProperty('--my', '50%');
    };

    return (
      <div
        className="relative h-full"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ perspective: '1200px', '--mx': '50%', '--my': '50%' }}
      >
        <m.div
          className={`${cardBase} will-change-transform`}
          style={{
            rotateX: tiltEnabled ? rotateX : 0,
            rotateY: tiltEnabled ? rotateY : 0,
            scale: tiltEnabled ? scale : 1,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-brand-50/60 opacity-80"></div>
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(255,122,0,0.22), transparent 60%)',
            }}
          ></div>
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/70"></div>
          <div className="relative z-10">{children}</div>
        </m.div>
      </div>
    );
  };

  React.useEffect(() => {
    document.title = 'About Us — Property Master Vadodara';
    const desc = 'Learn about Property Master Vadodara, our mission, and how we help you find the best properties in Vadodara.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
  }, []);

  return (
    <>
      <Header />

      <LazyMotion features={domAnimation}>
        <m.div {...pageMotion}>
          {/* ── HERO — split image + bio on dark bg ── */}
          <m.section {...reveal} className="relative w-full overflow-hidden bg-gray-900 pt-16 sm:pt-20 pb-28">
        {/* glow blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-32 left-10 w-64 h-64 bg-brand-300 rounded-full opacity-10 blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT — image */}
            <m.div {...hoverLift} className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src={aboutimg}
                alt="Vasudha Thakur — Property Master Vadodara"
                className="w-full h-80 sm:h-96 lg:h-120 object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-gray-900/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white">
                  <p className="font-bold text-base">Vasudha Thakur</p>
                  <p className="text-sm text-gray-300">Founder &amp; CEO, Property Master Vadodara</p>
                </div>
              </div>
            </m.div>

            {/* RIGHT — bio */}
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/50 text-brand-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
                <Building2 className="w-3.5 h-3.5" /> About Us
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15]">
                Trusted Real Estate<br />
                <span className="text-brand-500">Consultancy in Vadodara</span>
              </h1>
              <div className="w-12 h-1 bg-brand-500 rounded-full"></div>
              <p className="text-gray-200 leading-relaxed">
                I am <strong className="text-white">Vasudha Thakur</strong>, owner and founder of{' '}
                <span className="text-brand-400 font-semibold">PROPERTY MASTER VADODARA</span> — a startup real
                estate venture dedicated exclusively to the Vadodara property market.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With an MBA in Finance, I have always been passionate about investment planning and
                financial growth. Combining my financial knowledge with a deep interest in real estate,
                I started Property Master Vadodara to provide smart, secure, and profitable property investment
                solutions in Vadodara.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We believe every person deserves to own their dream property — whether it is a cozy home
                for your family or a high-yield investment asset. Our team works tirelessly to make that
                dream a reality.
              </p>

              {/* Trust highlights */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                {[
                  {
                    icon: Target,
                    title: 'Personalized Guidance',
                    desc: 'Shortlists aligned to your budget, lifestyle, and ROI goals.',
                  },
                  {
                    icon: Users,
                    title: 'Client-First Support',
                    desc: 'Transparent, responsive guidance from search to registration.',
                  },
                  {
                    icon: Award,
                    title: 'Verified Quality',
                    desc: 'Only trusted builders and quality-checked properties.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <m.div key={title} {...hoverLift} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{desc}</p>
                  </m.div>
                ))}
              </div>
            </div>

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

        {/* ── HOW WE HELP CARDS ── */}
        <m.section {...reveal} className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full opacity-30 blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500/10 to-orange-500/10 border border-brand-500/20 text-brand-600 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                <Star className="w-3.5 h-3.5" /> Our Expertise
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Our Services & <span className="text-gradient-brand">Approach</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Comprehensive real estate solutions tailored to your unique needs and aspirations
              </p>
            </div>

            {/* New premium design for services section */}
            <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">
              {/* Who We Guide - Enhanced Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                <div className="relative bg-white rounded-3xl border border-gray-200/80 p-8 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.15)] h-full transition-all duration-300 group-hover:shadow-[0_25px_60px_-20px_rgba(255,122,0,0.2)]">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(255,122,0,0.4)]">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Service Focus</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">Who We Guide</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    {[
                      { icon: Home, text: 'First-time homebuyers looking for their dream home', bgColor: 'bg-blue-50', ringColor: 'ring-blue-100', textColor: 'text-blue-500' },
                      { icon: DollarSign, text: 'Individual investors seeking high ROI properties', bgColor: 'bg-green-50', ringColor: 'ring-green-100', textColor: 'text-green-500' },
                      { icon: Building2, text: 'Long-term property investors building a portfolio', bgColor: 'bg-purple-50', ringColor: 'ring-purple-100', textColor: 'text-purple-500' },
                      { icon: Users, text: 'Families relocating to Vadodara', bgColor: 'bg-amber-50', ringColor: 'ring-amber-100', textColor: 'text-amber-500' },
                    ].map(({ icon: Icon, text, bgColor, ringColor, textColor }, index) => (
                      <div key={text} className="flex items-start gap-4 group/item">
                        <div className={`mt-1 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${bgColor} ring-1 ${ringColor} transition-all duration-300 group-hover/item:${bgColor.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                          <Icon className={`h-4 w-4 ${textColor}`} />
                        </div>
                        <p className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-300">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Our Approach - Enhanced Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                <div className="relative bg-white rounded-3xl border border-gray-200/80 p-8 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.15)] h-full transition-all duration-300 group-hover:shadow-[0_25px_60px_-20px_rgba(255,122,0,0.2)]">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(255,122,0,0.4)]">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Advisory Method</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">Our Approach</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Many customers want to invest in property but are confused about location, builder
                    quality, or budget fit. That is exactly where we step in — with honest, expert guidance
                    every step of the way.
                  </p>
                  
                  <div className="space-y-5">
                    {[
                      { icon: DollarSign, text: 'Budget-friendly pricing with maximum value', bgColor: 'bg-emerald-50', ringColor: 'ring-emerald-100', textColor: 'text-emerald-500' },
                      { icon: Building2, text: 'Only quality-verified constructions', bgColor: 'bg-indigo-50', ringColor: 'ring-indigo-100', textColor: 'text-indigo-500' },
                      { icon: MapPin, text: 'Prime and high-appreciation locations', bgColor: 'bg-rose-50', ringColor: 'ring-rose-100', textColor: 'text-rose-500' },
                      { icon: Home, text: 'End-to-end support from search to registration', bgColor: 'bg-cyan-50', ringColor: 'ring-cyan-100', textColor: 'text-cyan-500' },
                    ].map(({ icon: Icon, text, bgColor, ringColor, textColor }, index) => (
                      <div key={text} className="flex items-start gap-4 group/item">
                        <div className={`mt-1 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${bgColor} ring-1 ${ringColor} transition-all duration-300 group-hover/item:${bgColor.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                          <Icon className={`h-4 w-4 ${textColor}`} />
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium group-hover/item:text-gray-900 transition-colors duration-300">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Our Values - Enhanced Card */}
              <div className="relative group lg:col-span-2">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                <div className="relative bg-white rounded-3xl border border-gray-200/80 p-8 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.15)] transition-all duration-300 group-hover:shadow-[0_25px_60px_-20px_rgba(255,122,0,0.2)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(255,122,0,0.4)]">
                        <Star className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Core Values</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">Our Values</h3>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                        Transparency
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                        Integrity
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        Excellence
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                    {[
                      'Transparency in every transaction',
                      'Client-first advisory approach',
                      'Honest market valuation — no inflated prices',
                      'Long-term relationship over one-time sales',
                      'Respect for every budget and requirement',
                    ].map((text, index) => (
                      <div key={text} className="group/item">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/10">
                            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                          </div>
                          <p className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-300">
                            {text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Benefits Section */}
            <div className="mt-16 pt-16 border-t border-gray-200">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-gray-900">Why Choose Property Master Vadodara</h3>
                <p className="text-gray-600 mt-2">Premium advantages that set us apart</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { icon: Award, title: 'Expertise', desc: 'MBA-backed insights' },
                  { icon: MapPin, title: 'Local Knowledge', desc: 'Vadodara specialists' },
                  { icon: Users, title: 'Personalized', desc: 'Tailored solutions' },
                  { icon: ShieldCheck, title: 'Trust', desc: 'Verified properties' },
                  { icon: Headphones, title: 'Support', desc: 'End-to-end guidance' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center group">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(255,122,0,0.4)] mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors duration-300">{title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </m.section>

        {/* ── MISSION BANNER ── */}
        <m.section {...reveal} className="relative py-20 bg-gray-900 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 bg-brand-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-64 h-64 bg-brand-300 rounded-full opacity-10 blur-3xl"></div>
          <div className="relative max-w-3xl mx-auto text-center px-4">
            <div className="w-16 h-16 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Award className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              To simplify property investment for every individual in Vadodara — whether you are buying your
              first home or expanding your investment portfolio — with complete transparency, deep expertise,
              and an unwavering commitment to your financial success.
            </p>
          </div>
        </m.section>

      </main>
        </m.div>
      </LazyMotion>
      <Footer />
    </>
  );
}
