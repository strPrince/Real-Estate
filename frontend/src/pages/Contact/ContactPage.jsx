import React, { useState } from "react";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { MapPin, Phone, Mail, Send, CheckCircle, Menu, X } from "lucide-react";
import { submitContactForm } from "../../api.js";
import globBg from "../../assets/glob.png";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

export default function ContactPage() {
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
        transition: { type: "spring", stiffness: 400, damping: 25 },
      };

  React.useEffect(() => {
    document.title = 'Contact Us — Property Master Vadodara';
    const desc = 'Get in touch with Property Master Vadodara for questions about buying, renting or investing in Vadodara real estate.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    location: "",
    query: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Submit the form data using our API
      await submitContactForm(formData);
      setSubmitted(true);
      // Reset form after submission
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          location: "",
          query: "",
        });
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
      // You could add error state here to show a message to the user
    }
  };

  return (
    <>
      <Header />

      <LazyMotion features={domAnimation}>
        <m.div {...pageMotion}>

      {/* ── HERO SECTION ── */}
      <m.section {...reveal} className="relative w-full overflow-hidden bg-gray-900 py-16 sm:py-24">
        {/* decorative brand circles */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-32 right-10 w-64 h-64 bg-brand-300 rounded-full opacity-10 blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-fit mb-6 mx-auto">
                <Send className="w-3.5 h-3.5" /> Get in Touch
             </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Let's Discuss<br />
              <span className="text-brand-400">Your Property Needs</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Have questions about properties in Vadodara? Fill out the form below and we'll get back to you shortly.
            </p>
          </div>
        </div>

        {/* wave at bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1440 80" className="w-full h-20" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </m.section>

       {/* ── CONTACT SECTION ── */}
      <main className="relative overflow-hidden bg-gray-50 py-16 sm:py-24">
        {/* background image across entire section */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-no-repeat opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `url(${globBg})`,
              backgroundPosition: "right 5% top 10%",
              backgroundSize: "min(100%, 95vw)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-white/45" />
        </div>
        {/* section content, following guidelines with eyebrow label */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div {...reveal} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* INFO BOXES LEFT */}
            <div className="relative flex flex-col gap-4 justify-center md:justify-start pl-8">
              <span className="pointer-events-none absolute left-3 top-3 bottom-3 w-px bg-gradient-to-b from-brand-500/50 via-brand-400/30 to-transparent" />
              <m.div {...hoverLift} className="group rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20">
                    <span className="absolute -left-7 top-1/2 h-[2px] w-7 -translate-y-1/2 bg-brand-500/40" />
                    <span className="absolute -left-8 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand-500/60 shadow-sm" />
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1">Email</div>
                    <div className="text-base font-semibold text-gray-900">info@propertymastervadodara.com</div>
                    <p className="text-sm text-gray-500 mt-1">Quick replies within 24 hours</p>
                  </div>
                </div>
              </m.div>
              <m.div {...hoverLift} className="group rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20">
                    <span className="absolute -left-7 top-1/2 h-[2px] w-7 -translate-y-1/2 bg-brand-500/40" />
                    <span className="absolute -left-8 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand-500/60 shadow-sm" />
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1">Office</div>
                    <div className="text-base font-semibold text-gray-900">101, Real Estate Tower, Vadodara, Gujarat</div>
                    <p className="text-sm text-gray-500 mt-1">Central location, easy parking</p>
                  </div>
                </div>
              </m.div>
              <m.div {...hoverLift} className="group rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20">
                    <span className="absolute -left-7 top-1/2 h-[2px] w-7 -translate-y-1/2 bg-brand-500/40" />
                    <span className="absolute -left-8 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand-500/60 shadow-sm" />
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1">Phone</div>
                    <div className="text-base font-semibold text-gray-900">+91 98765 43210</div>
                    <p className="text-sm text-gray-500 mt-1">Mon-Sat, 9:00 AM – 7:00 PM</p>
                  </div>
                </div>
              </m.div>
              <m.div {...hoverLift} className="group rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20">
                    <span className="absolute -left-7 top-1/2 h-[2px] w-7 -translate-y-1/2 bg-brand-500/40" />
                    <span className="absolute -left-8 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white ring-2 ring-brand-500/60 shadow-sm" />
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1">Support</div>
                    <div className="text-base font-semibold text-gray-900">Verified listings only</div>
                    <p className="text-sm text-gray-500 mt-1">Trusted guidance for every budget</p>
                  </div>
                </div>
              </m.div>
            </div>
            {/* CONTACT FORM RIGHT */}
            <div className="relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[360px]">
              {/* creative border and shadow */}
              <m.div {...hoverLift} className="relative z-10 w-full max-w-md md:ml-auto rounded-2xl border border-white/70 shadow-[0_8px_28px_rgba(15,23,42,0.12)] bg-white/95 p-5">
                {/* eyebrow label */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full mb-4">
                  Contact
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center text-balance">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 mb-6 text-center text-pretty">
                  We'll respond to your queries within 24 hours
                </p>

                {submitted ? (
                  <div className="text-center py-8 max-w-xs mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500/10 rounded-full mb-6">
                      <CheckCircle className="w-8 h-8 text-success-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Thank You!
                    </h3>
                    <p className="text-gray-600">
                      Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-1">
                        <label
                          htmlFor="contactNumber"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="contactNumber"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Location (Optional)
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="query"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Query <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="query"
                        name="query"
                        value={formData.query}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
                        placeholder="Describe your property requirements or questions..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold px-6 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-[0_4px_14px_0_rgba(255,122,0,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Send className="w-5 h-5 animate-pulse" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </span>
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4">
                      We respect your privacy. Your information is secure with us.
                    </p>
                  </form>
                )}
              </m.div>
            </div>
          </m.div>
        </div>

        {/* Map Section */}
        <m.div {...reveal} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <div className="relative w-full h-0 pb-[56.25%]">
              <iframe
                title="Vadodara City Map"
                src="https://www.google.com/maps?ll=22.3072,73.1812&z=12&output=embed"
                className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="px-4 py-3 bg-white">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Our Office — Vadodara</div>
                  <div className="text-xs text-gray-500">101, Real Estate Tower, Vadodara, Gujarat</div>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      </main>
        </m.div>
      </LazyMotion>
      <Footer />
    </>
  );
}
