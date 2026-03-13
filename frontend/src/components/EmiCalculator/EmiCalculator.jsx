import { useEffect, useRef, useState } from 'react';

const HERO_DEFAULTS = {
  price: 4500000,
  downPayment: 900000,
  rate: 8.75,
  years: 20,
};

function useCountUp(value, duration = 600) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(0);
  const displayRef = useRef(value);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const startValue = displayRef.current;
    const endValue = value;

    if (startValue === endValue) {
      setDisplay(endValue);
      return undefined;
    }

    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return display;
}

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.max(0, Math.round((value || 0) * 100) / 100));

export default function EmiCalculator({ headerVariant = 'inner' }) {
  const headerIsOuter = headerVariant === 'outer';
  const headerChipTone = headerIsOuter
    ? 'text-brand-500 bg-brand-50 border-brand-100'
    : 'text-brand-600 bg-white/70 border-white/70';
  const [emiPrice, setEmiPrice] = useState(HERO_DEFAULTS.price);
  const [emiDownPayment, setEmiDownPayment] = useState(HERO_DEFAULTS.downPayment);
  const [emiRate, setEmiRate] = useState(HERO_DEFAULTS.rate);
  const [emiYears, setEmiYears] = useState(HERO_DEFAULTS.years);

  const principal = Math.max(emiPrice - emiDownPayment, 0);
  const monthlyRate = emiRate / 100 / 12;
  const totalMonths = Math.max(emiYears * 12, 1);
  const emi =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayable = emi * totalMonths;
  const totalInterest = totalPayable - principal;

  const animatedEmi = useCountUp(emi);
  const animatedPrincipal = useCountUp(principal);
  const animatedInterest = useCountUp(totalInterest);
  const animatedTotal = useCountUp(totalPayable);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-white border border-gray-200 shadow-[0_24px_60px_-22px_rgba(15,23,42,0.18)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-24 -top-10 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl" />
            <div className="absolute right-6 top-2 text-[180px] font-black leading-none text-brand-200/25">
              {'\u20B9'}
            </div>
            <div className="absolute right-10 top-24 text-[40px] font-semibold uppercase tracking-[0.45em] text-brand-300/30">
              EMI
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-size-[26px_26px] opacity-50" />
          </div>

          <div className="relative p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <span
                  className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] px-3 py-1.5 rounded-full border ${headerChipTone}`}
                >
                  EMI Calculator
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                  Plan Your Vadodara Property EMI
                </h2>
                <p className="mt-3 text-gray-500 leading-relaxed text-pretty">
                  Estimate your monthly EMI with local pricing benchmarks. Adjust the value, down payment,
                  interest rate, and tenure to see a clear breakdown in seconds.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-gray-400">
                  No signup
                </span>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-gray-400">
                  Live breakdown
                </span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10">
              <div className="relative flex flex-col justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white/80 border border-white/70 px-4 py-3 shadow-[0_14px_40px_-20px_rgba(15,23,42,0.25)]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Principal
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-2">
                      {formatINR(animatedPrincipal)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/80 border border-white/70 px-4 py-3 shadow-[0_14px_40px_-20px_rgba(15,23,42,0.25)]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Total Interest
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-2">
                      {formatINR(animatedInterest)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/80 border border-white/70 px-4 py-3 shadow-[0_14px_40px_-20px_rgba(15,23,42,0.25)]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Total Payable
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-2">
                      {formatINR(animatedTotal)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-5">
                  Estimates are indicative for Vadodara properties. Actual EMI may vary based on lender policies.
                </p>
              </div>

              <div className="relative rounded-3xl bg-white/90 backdrop-blur-sm border border-white/70 shadow-[0_26px_70px_-20px_rgba(15,23,42,0.3)] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Estimated EMI
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
                      {formatINR(animatedEmi)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">per month</div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-500 text-white font-bold shadow-[0_16px_40px_-14px_rgba(255,122,0,0.5)]">
                    EMI
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-left w-full">
                    <span className="text-[10px] font-bold tracking-[0.22em] text-gray-400">
                      PROPERTY VALUE ({'\u20B9'})
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={emiPrice}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setEmiPrice(Number.isFinite(next) ? next : 0);
                      }}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[13px] text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </label>
                  <label className="text-left w-full">
                    <span className="text-[10px] font-bold tracking-[0.22em] text-gray-400">
                      DOWN PAYMENT ({'\u20B9'})
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={emiDownPayment}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setEmiDownPayment(Number.isFinite(next) ? next : 0);
                      }}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[13px] text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </label>
                  <label className="text-left w-full">
                    <span className="text-[10px] font-bold tracking-[0.22em] text-gray-400">
                      INTEREST RATE (%)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={emiRate}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setEmiRate(Number.isFinite(next) ? next : 0);
                      }}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[13px] text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </label>
                  <label className="text-left w-full">
                    <span className="text-[10px] font-bold tracking-[0.22em] text-gray-400">
                      TENURE (YEARS)
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={emiYears}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setEmiYears(Number.isFinite(next) ? next : 1);
                      }}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[13px] text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </label>
                </div>

                {/* scattered low-opacity symbols across the card */}
                <div className="pointer-events-none absolute inset-0">
                  <span className="absolute left-6 top-6 text-[28px] font-extrabold text-brand-200/20 rotate-6">+</span>
                  <span className="absolute right-10 top-12 text-[24px] font-extrabold text-brand-200/18 -rotate-12">-</span>
                  <span className="absolute left-14 bottom-10 text-[26px] font-extrabold text-brand-200/16 rotate-12">x</span>
                  <span className="absolute right-6 bottom-6 text-[30px] font-extrabold text-brand-200/14 rotate-3">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

