import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle, Info, ArrowRight, Lightbulb, Image as ImageIcon, MapPin, Tag } from 'lucide-react';

const HelpPage = () => {
  const steps = [
    {
      title: 'Login to Your Account',
      description: 'First, ensure you are logged in to your Property Master account. If you don\'t have one, quickly sign up.',
      icon: <CheckCircle className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Navigate to "Post Property"',
      description: 'Click on your profile icon in the navigation bar and select "Post Property" from the dropdown menu.',
      icon: <ArrowRight className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Fill in Property Details',
      description: 'Provide accurate information about your property including title, description, price, and location.',
      icon: <Info className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Upload High-Quality Images',
      description: 'Add clear, well-lit photos of your property to attract more potential buyers or tenants.',
      icon: <ImageIcon className="w-6 h-6 text-brand-500" />
    },
    {
      title: 'Submit for Review',
      description: 'Double-check all information and click "Submit". Your property will be live once approved.',
      icon: <Tag className="w-6 h-6 text-brand-500" />
    }
  ];

  const bestPractices = [
    {
      title: 'Use Clear Titles',
      description: 'Instead of "Nice House", use "Spacious 3BHK Apartment in Alkapuri with Modern Amenities".',
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      title: 'Accurate Pricing',
      description: 'Research local market rates to set a competitive and realistic price for your property.',
      icon: <Tag className="w-5 h-5" />
    },
    {
      title: 'Detailed Description',
      description: 'Mention key features like balcony, parking, security, and proximity to schools or hospitals.',
      icon: <Info className="w-5 h-5" />
    },
    {
      title: 'Correct Location',
      description: 'Pin the exact location on the map to help users understand the neighborhood better.',
      icon: <MapPin className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help You?</h1>
          <p className="text-lg text-gray-600">Your guide to getting the most out of Property Master</p>
        </motion.div>

        {/* How to Post Property Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center text-sm">1</span>
            How to Post a Property
          </h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices Section */}
        <section className="bg-brand-900 rounded-3xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-brand-400" />
            Best Practices for Listing
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-8">
            {bestPractices.map((practice, index) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center mb-4 text-brand-400">
                  {practice.icon}
                </div>
                <h3 className="font-bold mb-2">{practice.title}</h3>
                <p className="text-brand-100/70 text-sm leading-relaxed">{practice.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Need More Help? */}
        <section className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">Our support team is here to help you 24/7.</p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-300"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;
