import React from 'react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { Home, MapPin, DollarSign, Building2, Award, Target, TrendingUp, Users, Star } from 'lucide-react';
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
        <m.section {...reveal} className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                <Star className="w-3.5 h-3.5" /> How We Help
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Services &amp; Approach</h2>
            </div>

            <div className="grid gap-10 lg:gap-12 lg:grid-cols-2">

              <InteractiveCard>
                <div className="flex items-center gap-4 mb-6" style={{ transform: 'translateZ(18px)' }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-600 ring-1 ring-brand-200/70 shadow-sm">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500/80">Service Focus</p>
                    <h3 className="text-xl font-bold text-gray-900">Who We Guide</h3>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-brand-200/60 via-gray-100 to-transparent mb-6"></div>
                <ul className="space-y-4" style={{ transform: 'translateZ(8px)' }}>
                {[
                  { icon: Home, text: 'First-time homebuyers looking for their dream home' },
                  { icon: DollarSign, text: 'Individual investors seeking high ROI properties' },
                  { icon: Building2, text: 'Long-term property investors building a portfolio' },
                  { icon: Users, text: 'Families relocating to Vadodara' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
                      <Icon className="h-4 w-4 text-brand-500" />
                    </span>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
                </ul>
              </InteractiveCard>

              <InteractiveCard>
                <div className="flex items-center gap-4 mb-6" style={{ transform: 'translateZ(18px)' }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-600 ring-1 ring-brand-200/70 shadow-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500/80">Advisory Method</p>
                    <h3 className="text-xl font-bold text-gray-900">Our Approach</h3>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-brand-200/60 via-gray-100 to-transparent mb-6"></div>
                <p className="text-gray-600 mb-6 leading-relaxed" style={{ transform: 'translateZ(10px)' }}>
                  Many customers want to invest in property but are confused about location, builder
                  quality, or budget fit. That is exactly where we step in — with honest, expert guidance
                  every step of the way.
                </p>
                <ul className="space-y-4" style={{ transform: 'translateZ(8px)' }}>
                {[
                  { icon: DollarSign, text: 'Budget-friendly pricing with maximum value' },
                  { icon: Building2, text: 'Only quality-verified constructions' },
                  { icon: MapPin, text: 'Prime and high-appreciation locations' },
                  { icon: Home, text: 'End-to-end support from search to registration' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
                      <Icon className="h-4 w-4 text-brand-500" />
                    </span>
                    <span className="leading-relaxed font-medium">{text}</span>
                  </li>
                ))}
                </ul>
              </InteractiveCard>

              <InteractiveCard>
                <div className="flex items-center gap-4 mb-6" style={{ transform: 'translateZ(18px)' }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-600 ring-1 ring-brand-200/70 shadow-sm">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500/80">Core Values</p>
                    <h3 className="text-xl font-bold text-gray-900">Our Values</h3>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-brand-200/60 via-gray-100 to-transparent mb-6"></div>
                <ul className="space-y-4" style={{ transform: 'translateZ(8px)' }}>
                {[
                  'Transparency in every transaction',
                  'Client-first advisory approach',
                  'Honest market valuation — no inflated prices',
                  'Long-term relationship over one-time sales',
                  'Respect for every budget and requirement',
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500/90 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"></span>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
                </ul>
              </InteractiveCard>

              <InteractiveCard>
                <div className="flex items-center gap-4 mb-6" style={{ transform: 'translateZ(18px)' }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-600 ring-1 ring-brand-200/70 shadow-sm">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500/80">Premium Advantage</p>
                    <h3 className="text-xl font-bold text-gray-900">Why Choose Us</h3>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-brand-200/60 via-gray-100 to-transparent mb-6"></div>
                <ul className="space-y-4" style={{ transform: 'translateZ(8px)' }}>
                {[
                  'Deep local knowledge of Vadodara micro-markets',
                  'MBA-backed financial insight for investment decisions',
                  'Curated listings — only the best properties',
                  'Direct dealer access — no middlemen',
                  'Post-purchase support and guidance',
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500/90 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"></span>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
                </ul>
              </InteractiveCard>

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
