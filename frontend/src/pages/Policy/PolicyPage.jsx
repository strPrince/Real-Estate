import React from "react";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

export default function PolicyPage() {
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

  React.useEffect(() => {
    document.title = 'Privacy Policy — Property Master Vadodara';
    const desc = 'Read the privacy policy for Property Master Vadodara.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
  }, []);

  return (
    <>
      <Header />

      <LazyMotion features={domAnimation}>
        <m.div {...pageMotion}>
      <m.section {...reveal} className="relative w-full overflow-hidden bg-gray-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1440 80" className="w-full h-20" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </m.section>

      <main className="relative bg-gray-50 overflow-hidden py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div {...reveal} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Property Master Vadodara is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose information about you when you use our website and services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We may collect personal information such as your name, email address, phone number, and location when you use our contact form or sign up for our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to respond to your inquiries, provide you with property-related information, and improve our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted partners who assist us in operating our website and providing our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us at info@propertymaster.com.
            </p>
          </m.div>
        </div>
      </main>
        </m.div>
      </LazyMotion>
      <Footer />
    </>
  );
}
