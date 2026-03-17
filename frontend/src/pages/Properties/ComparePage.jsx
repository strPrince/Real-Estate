import { useNavigate, Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext.jsx';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { 
  X, 
  Trash2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Check, 
  Building2,
  ChevronLeft,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatPrice = (n) => {
  if (!n) return '—';
  if (n >= 10_000_000) return `Rs ${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(1)} L`;
  return `Rs ${n.toLocaleString('en-IN')}`;
};

export default function ComparePage() {
  const { selectedProperties, removeProperty, clearCompare } = useCompare();
  const navigate = useNavigate();

  const comparisonRows = [
    { label: 'Price', key: 'price', format: (v) => formatPrice(v) },
    { label: 'Type', key: 'type', format: (v) => <span className="capitalize">{v}</span> },
    { label: 'Intent', key: 'intent', format: (v) => v === 'rent' ? 'For Rent' : 'For Sale' },
    { label: 'Locality', key: 'location', format: (v) => v?.locality || '—' },
    { label: 'Bedrooms', key: 'bedrooms', format: (v) => v ? `${v} BHK` : '—' },
    { label: 'Bathrooms', key: 'bathrooms', format: (v) => v || '—' },
    { label: 'Area', key: 'area', format: (v) => v ? `${v} sqft` : '—' },
    { label: 'Featured', key: 'featured', format: (v) => v ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : '—' },
  ];

  if (selectedProperties.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nothing to compare</h1>
          <p className="text-gray-500 text-center max-w-sm mb-8">
            You haven't selected any properties to compare yet. Browse our listings and click "+ Compare" to add them here.
          </p>
          <Link 
            to="/properties" 
            className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
          >
            Browse Properties
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-500 transition-colors mb-4"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Compare Properties</h1>
              <p className="text-gray-500 mt-1">Comparing {selectedProperties.length} selected listings</p>
            </div>
            <button
              onClick={clearCompare}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div 
                className="min-w-[800px] grid divide-x divide-gray-100"
                style={{ gridTemplateColumns: `repeat(${selectedProperties.length + 1}, minmax(0, 1fr))` }}
              >
                
                {/* Labels Column */}
                <div className="col-span-1 bg-gray-50/50">
                  <div className="h-72 flex items-center px-6 font-bold text-gray-400 text-xs uppercase tracking-widest">
                    Property Details
                  </div>
                  {comparisonRows.map((row) => (
                    <div key={row.label} className="h-16 flex items-center px-6 text-sm font-bold text-gray-500 border-t border-gray-100">
                      {row.label}
                    </div>
                  ))}
                  <div className="h-20 border-t border-gray-100" />
                </div>

                {/* Property Columns */}
                {selectedProperties.map((p) => (
                  <div key={p.id} className="col-span-1 group">
                    {/* Header with image */}
                    <div className="h-72 p-6 relative">
                      <button
                        onClick={() => removeProperty(p.id)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur text-gray-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <Link to={`/properties/${p.id}`} className="block h-full group/item">
                        <div className="h-40 rounded-2xl overflow-hidden mb-4 border border-gray-100">
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80'} 
                            alt={p.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          />
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover/item:text-brand-500 transition-colors">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{p.location?.locality || 'Vadodara'}</span>
                        </div>
                      </Link>
                    </div>

                    {/* Data Rows */}
                    {comparisonRows.map((row) => (
                      <div key={row.label} className="h-16 flex items-center px-6 text-sm text-gray-700 border-t border-gray-100 font-medium text-center justify-center">
                        {row.format(p[row.key])}
                      </div>
                    ))}

                    {/* Action Row */}
                    <div className="h-20 flex items-center px-6 border-t border-gray-100 justify-center">
                      <Link
                        to={`/properties/${p.id}`}
                        className="w-full bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 flex items-start gap-3 p-4 bg-brand-50 rounded-2xl border border-brand-100">
            <Check className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <p className="text-sm text-brand-800 leading-relaxed">
              Comparison view helps you make informed decisions by highlighting differences in price, size, and location between your top choices. Add up to 4 properties to compare them side-by-side.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
