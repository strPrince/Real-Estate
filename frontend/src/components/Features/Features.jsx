import { ShieldCheck, Award, Headphones, MapPin } from 'lucide-react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

const FEATURE_LEFT = [
  {
    Icon: MapPin,
    title: 'Local Market Experts',
    subtitle: 'Deep Vadodara Knowledge',
    desc: 'Our team has comprehensive insights into Vadodara\'s micro-markets, neighborhood trends, and emerging hotspots.',
  },
  {
    Icon: Headphones,
    title: 'Personalized Guidance',
    subtitle: 'Tailored to Your Needs',
    desc: 'We provide customized property recommendations based on your budget, lifestyle, and investment goals.',
  },
];

const FEATURE_RIGHT = [
  {
    Icon: Award,
    title: 'Verified Properties',
    subtitle: 'Quality Assured',
    desc: 'Every property is thoroughly vetted for legal compliance, construction quality, and market value.',
  },
  {
    Icon: ShieldCheck,
    title: 'Transparent Process',
    subtitle: 'Honest & Ethical',
    desc: 'No hidden costs, no false promises. We ensure complete transparency at every step of your property journey.',
  },
];

export default function Features() {
  const shouldReduceMotion = false; // useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const baseMotion = shouldReduceMotion
    ? {}
    : { 
        variants: fadeUp, 
        initial: 'hidden', 
        animate: 'visible',
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      };

  return (
    <LazyMotion features={domAnimation}>
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <m.h2
              {...baseMotion}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight text-balance"
            >
              Why Choose Us
            </m.h2>
            <m.p
              {...baseMotion}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1], delay: shouldReduceMotion ? 0 : 0.05 }}
              className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-xl lg:ml-auto"
            >
              Property Master Vadodara is your trusted partner in finding the perfect property. With MBA-backed financial insights and deep local expertise, we simplify your real estate journey.
            </m.p>
          </div>

          <div className="relative mt-12">
            <svg
              className="absolute left-1/2 top-6 -translate-x-1/2 w-[min(920px,94vw)] h-40 text-gray-200"
              viewBox="0 0 920 160"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 140 C 200 40, 720 40, 900 140"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />
            </svg>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-10 items-center">
              <div className="space-y-7">
                {FEATURE_LEFT.map(({ Icon, title, subtitle, desc }, index) => (
                  <m.div
                    key={title}
                    {...baseMotion}
                    transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1], delay: shouldReduceMotion ? 0 : index * 0.08 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-3 text-gray-900">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 text-brand-600">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-semibold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{subtitle}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </m.div>
                ))}
              </div>

              <div className="relative mx-auto">
                <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-b from-[#ffd9c8] via-[#f9b1b1] to-[#f1a0b4] blur-[0.5px]" />
                <div className="relative rounded-[32px] bg-white/70 p-4 shadow-[0_20px_60px_-18px_rgba(15,23,42,0.35)] border border-white/70">
                  <img
                    src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80"
                    alt="Modern city property"
                    className="w-[260px] sm:w-[300px] lg:w-[320px] h-auto rounded-[24px] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="space-y-7">
                {FEATURE_RIGHT.map(({ Icon, title, subtitle, desc }, index) => (
                  <m.div
                    key={title}
                    {...baseMotion}
                    transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1], delay: shouldReduceMotion ? 0 : (index + 2) * 0.08 }}
                    className="space-y-2 lg:text-right"
                  >
                    <div className="flex items-center gap-3 text-gray-900 lg:justify-end">
                      <h3 className="font-semibold text-gray-900 order-2 lg:order-1">{title}</h3>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 text-brand-600 order-1 lg:order-2">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{subtitle}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </m.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
