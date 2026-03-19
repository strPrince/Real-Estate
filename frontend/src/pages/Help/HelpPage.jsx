import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { motion } from 'framer-motion';
import { 
  HelpCircle, CheckCircle, Info, ArrowRight, Lightbulb, 
  Image as ImageIcon, MapPin, Tag, Sparkles, Shield, 
  Clock, Zap, MessageCircle 
} from 'lucide-react';

const HelpPage = () => {
  const steps = [
    {
      title: 'Login or Sign Up',
      description: 'Start by accessing your account. If you\'re new, creating an account takes less than a minute.',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Select "Post Property"',
      description: 'Navigate to your dashboard or click your profile to find the "Post Property" option.',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-brand-500'
    },
    {
      title: 'Details & Valuation',
      description: 'Provide accurate specs and set a competitive price based on our market suggestions.',
      icon: <Tag className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Visual Showcase',
      description: 'Upload high-resolution photos. Listings with 5+ photos get 3x more inquiries.',
      icon: <ImageIcon className="w-6 h-6" />,
      color: 'bg-emerald-500'
    },
    {
      title: 'Final Review',
      description: 'Submit for verification. Our team usually approves quality listings within 2 hours.',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ];

  const bestPractices = [
    {
      title: 'Specific Headlines',
      description: 'Highlight the unique selling point like "Penthouse with Private Terrace" or "Quiet Corner Plot".',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      title: 'Verified Location',
      description: 'Ensure your map pin is exact. Buyers prioritize listings with precise neighborhood data.',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      title: 'Feature Transparency',
      description: 'Be clear about age of property, legal status (NA/NOC), and existing amenities.',
      icon: <Info className="w-5 h-5" />
    },
    {
      title: 'Swift Responses',
      description: 'Keep your notifications on. Quick replies significantly increase your lead conversion rate.',
      icon: <Clock className="w-5 h-5" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-100 selection:text-brand-600">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-600 font-semibold text-sm mb-6"
          >
            <HelpCircle className="w-4 h-4" />
            Support Center
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            How can we <span className="text-gradient-brand">help you</span> today?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto text-pretty"
          >
            From listing your first property to closing the deal, we've compiled everything you need to succeed on Property Master.
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-24 sm:px-6 lg:px-8">
        {/* Step-by-Step Guide */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Selling / Renting Guide</h2>
              <p className="text-gray-500">A seamless 5-step process to get your listing live.</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-400">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-500" /> Start</span>
              <div className="w-12 h-px bg-gray-200" />
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200" /> End</span>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="h-full p-8 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-b-4 border-b-transparent hover:border-b-brand-500">
                  <div className={`w-14 h-14 ${step.color} shadow-lg shadow-${step.color.split('-')[1]}-500/20 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <div className="absolute top-8 right-8 text-4xl font-black text-gray-50 group-hover:text-brand-500/10 transition-colors">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Best Practices Section */}
        <section className="relative p-12 rounded-[2.5rem] bg-gray-900 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles className="w-32 h-32 text-white" />
          </div>
          
          <div className="relative z-10 grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-24">
            <div>
              <span className="text-brand-400 font-bold uppercase tracking-widest text-xs mb-4 block">Pro Tips</span>
              <h2 className="text-3xl font-bold text-white mb-6">Maximize Your Listing Visibility</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-pretty">
                Our algorithm prioritizes high-quality content. Following these simple rules can double your organic reach.
              </p>
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Need Advice?</div>
                  <div className="text-gray-400 text-xs text-nowrap">Consult with our local agents.</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {bestPractices.map((practice, index) => (
                <div key={index} className="glass-panel !bg-white/5 !border-white/10 p-6 rounded-2xl group hover:!bg-brand-500/10 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-500 shadow-[0_0_20px_rgba(255,122,0,0.3)] flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                    {practice.icon}
                  </div>
                  <h3 className="text-white font-bold mb-2 tracking-tight">{practice.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed text-pretty">{practice.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="mt-24">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50 flex items-start gap-6 group hover:border-brand-200 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community FAQ</h3>
                <p className="text-gray-500 text-sm mb-6">Find instant answers to general questions in our community-driven FAQ section.</p>
                <a href="/#faq" className="text-brand-600 font-bold text-sm inline-flex items-center gap-2 hover:gap-3 transition-all">
                  Browse FAQs <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="relative p-1 bg-gradient-to-br from-brand-400 to-blue-500 rounded-3xl overflow-hidden group">
              <div className="h-full bg-white rounded-[1.4rem] p-8 flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Still Stuck?</h3>
                  <p className="text-gray-500 text-sm mb-6">Our dedicated support experts are available 24/7 to resolve your technical queries.</p>
                  <a href="/contact" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors">
                    Chat with an Expert
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;
