import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { 
  ShieldCheck, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  ChevronRight,
  Info,
  Lock,
  Scale
} from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { submitContactForm } from "../../api.js";

const LegalPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("policy"); // default to privacy policy
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    location: "",
    query: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set active tab based on path
  useEffect(() => {
    if (location.pathname === "/terms") {
      setActiveTab("terms");
    } else {
      setActiveTab("policy");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await submitContactForm(formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", contactNumber: "", location: "", query: "" });
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
    }
  };

  const reveal = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const tabContent = {
    policy: {
      title: "Privacy Policy",
      icon: <ShieldCheck className="w-6 h-6" />,
      content: (
        <div className="space-y-8 text-gray-700">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-500" /> 1. Introduction
            </h3>
            <p className="leading-relaxed">
              At Property Master Vadodara, we prioritize your privacy. This policy outlines how we handle your personal data when you use our premium real estate services. We are committed to transparency and security in every interaction.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-500" /> 2. Data Collection
            </h3>
            <p className="leading-relaxed">
              We collect information that helps us provide a tailored experience, including:
            </p>
            <ul className="list-none space-y-3 mt-4">
              {[
                "Contact details (Name, Email, Phone)",
                "Preferences for property types and locations",
                "Interaction data to improve our platform's performance"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-500" /> 3. Data Protection
            </h3>
            <p className="leading-relaxed">
              Your data is encrypted and stored on secure servers. We never sell your information to third-party advertisers. Our internal protocols ensure that only authorized personnel have access to sensitive client data.
            </p>
          </section>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-8 text-gray-700">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-500" /> 1. Agreement to Terms
            </h3>
            <p className="leading-relaxed">
              By accessing Property Master Vadodara, you agree to abide by these terms. Our platform is designed to facilitate real estate transactions with integrity and professionalism.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-500" /> 2. User Obligations
            </h3>
            <p className="leading-relaxed">
              Users are expected to provide accurate information when listing properties or inquiring about them. Misrepresentation of data may lead to account suspension.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" /> 3. Property Listings
            </h3>
            <p className="leading-relaxed">
              While we strive for 100% accuracy, Property Master Vadodara is not liable for minor discrepancies in property descriptions provided by third-party sellers. We act as a professional bridge between buyers and sellers.
            </p>
          </section>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <LazyMotion features={domAnimation}>
        {/* Hero Section */}
        <m.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative py-20 overflow-hidden bg-slate-950 text-white"
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <m.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 mb-6 text-[10px] font-bold tracking-[0.25em] uppercase bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400"
            >
              Legal & Compliance
            </m.span>
            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-display leading-tight mb-6 font-extrabold text-white"
            >
              Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-orange-500 to-orange-600">Standard</span>
            </m.h1>            <m.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed"
            >
              We are committed to excellence and transparency in all our operations. 
              Read our policies or reach out to our legal support team.
            </m.p>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-50 to-transparent" />
        </m.section>

        {/* Content Section */}
        <section className="relative z-10 -mt-8 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-8">
              
              {/* Sidebar Navigation */}
              <m.aside 
                {...reveal}
                className="lg:sticky lg:top-24 h-fit"
              >
                <div className="p-6 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl shadow-slate-200/50">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Navigation</h2>
                  <nav className="space-y-2">
                    {Object.entries(tabContent).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                          activeTab === key 
                            ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`${activeTab === key ? "text-white" : "text-brand-500"}`}>
                          {item.icon}
                        </span>
                        <span className="font-semibold text-sm">{item.title}</span>
                      </button>
                    ))}
                  </nav>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="p-4 rounded-2xl bg-slate-900 text-white">
                      <p className="text-xs text-slate-400 mb-2 italic">Need immediate help?</p>
                      <a href="tel:+919876543210" className="flex items-center gap-2 group underline-offset-4 hover:underline">
                        <Phone className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-bold">+91 98765 43210</span>
                      </a>
                    </div>
                  </div>
                </div>
              </m.aside>

              {/* Main Policy Content */}
              <m.main 
                {...reveal}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 min-h-[600px]"
              >
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-display text-slate-900 tracking-wide">
                    {tabContent[activeTab].title}
                  </h2>
                  <div className="text-xs font-semibold text-slate-400">
                    Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <m.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {tabContent[activeTab].content}
                </m.div>
              </m.main>
            </div>
          </div>
        </section>

        {/* Floating Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>
      </LazyMotion>

      <Footer />
    </div>
  );
};

export default LegalPage;
