import React from "react";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

export default function TermsPage() {
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
    document.title = 'Terms of Service — Property Master Vadodara';
    const desc = 'Read the terms of service for Property Master Vadodara.';
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
              Terms of Service
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
              Welcome to Property Master Vadodara. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions of use.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Use of Our Services</h2>
            <p className="text-gray-600 mb-4">
              You agree to use our services only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Property Listings</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide accurate and up-to-date information about properties listed on our website. However, we cannot guarantee the accuracy, completeness, or reliability of any property information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us at info@propertymaster.com.
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
