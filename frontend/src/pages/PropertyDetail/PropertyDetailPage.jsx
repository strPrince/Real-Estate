  import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import {
  MapPin, BedDouble, Bath, Maximize2, Tag, Calendar,
  ChevronLeft, ChevronRight, Phone, Mail, Share2,
} from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';
import PropertyCard from '../../components/PropertyCard/PropertyCard.jsx';
import { getCachedProperties, getProperty, submitInquiry } from '../../api.js';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PLACEHOLDER = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80';

const getRelatedProperties = (current, list) => {
  if (!current || !Array.isArray(list)) return [];
  const scored = list
    .filter((item) => item?.id && item.id !== current.id)
    .map((item) => {
      let score = 0;
      if (item.type && current.type && item.type === current.type) score += 3;
      if (item.intent && current.intent && item.intent === current.intent) score += 2;
      if (item.location?.locality && current.location?.locality && item.location.locality === current.location.locality) score += 3;
      if (item.bedrooms && current.bedrooms && item.bedrooms === current.bedrooms) score += 1;
      if (item.bathrooms && current.bathrooms && item.bathrooms === current.bathrooms) score += 1;
      if (typeof item.price === 'number' && typeof current.price === 'number') {
        const diff = Math.abs(item.price - current.price) / Math.max(current.price, 1);
        if (diff <= 0.2) score += 1;
      }
      return { item, score };
    })
    .filter((entry) => entry.score > 0);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const priceA = typeof a.item.price === 'number' && typeof current.price === 'number'
      ? Math.abs(a.item.price - current.price)
      : Number.MAX_SAFE_INTEGER;
    const priceB = typeof b.item.price === 'number' && typeof current.price === 'number'
      ? Math.abs(b.item.price - current.price)
      : Number.MAX_SAFE_INTEGER;
    return priceA - priceB;
  });

  return scored.map((entry) => entry.item);
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const isLocked = !currentUser;
  const shouldReduceMotion = false; // useReducedMotion();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

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
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
      };

  const hoverLift = shouldReduceMotion
    ? {}
    : {
        whileHover: { y: -5, scale: 1.01 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 260, damping: 18 },
      };

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    getProperty(id)
      .then((data) => {
        setProperty(data);
        document.title = `${data.title} - Property Master Vadodara`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
          meta.setAttribute('content', `Details and specifications for ${data.title} in Vadodara. Contact Property Master Vadodara for inquiries and site visits.`);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleInquiry(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitInquiry({
        ...form,
        propertyId: id,
        propertyTitle: property.title,
        propertyLink: `${window.location.origin}/properties/${id}`,
      });
      toast.success('Inquiry sent! We will contact you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Could not copy link'));
  }

  const formatPrice = (n) => {
    if (!n) return '-';
    if (n >= 10_000_000) return `Rs ${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(2)} L`;
    return `Rs ${n.toLocaleString('en-IN')}`;
  };

  if (loading) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
          <SkeletonCard />
        </div>
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
          <div className="h-24 w-full bg-gray-100 rounded-xl" />
          <div className="h-11 w-full bg-gray-200 rounded-xl" />
          <div className="h-11 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-semibold text-gray-700">Property not found</p>
          <Link to="/properties" className="mt-4 inline-block text-accent-500 hover:underline">Back to listings</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  const images = property.images?.length ? property.images : [PLACEHOLDER];
  const lat = property.location?.lat || 19.076;
  const lng = property.location?.lng || 72.8777;
  const relatedProperties = getRelatedProperties(property, getCachedProperties()).slice(0, 3);
  const descriptionPreview = isLocked && property.description
    ? `${property.description.split(/\s+/).slice(0, 40).join(' ')}...`
    : property.description;
  const amenitiesPreview = isLocked
    ? (property.amenities || []).slice(0, 3)
    : (property.amenities || []);

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.main {...pageMotion} className="pb-20 bg-[#F7F4F1]">
        <m.div {...reveal} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] font-semibold text-gray-500 bg-white/70 border border-white/80 px-3 py-2 rounded-full shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]">
            <Link to="/" className="hover:text-accent-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/properties" className="hover:text-accent-500">Properties</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800 truncate max-w-[220px] sm:max-w-none">{property.title}</span>
          </div>
        </m.div>

        <m.div {...reveal} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 min-w-0 space-y-8">
              <m.div className="bg-white rounded-[30px] overflow-hidden border border-white/80 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)]">
                <div className="relative h-72 sm:h-96 md:h-[520px]">
                  <img
                    src={images[activeImg]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-600">
                    {property.intent === 'rent' ? 'For Rent' : property.intent === 'commercial' ? 'Commercial' : 'For Sale'}
                  </div>
                  {images.length > 1 && (
                    <div className="absolute right-4 bottom-4 rounded-full bg-black/55 text-white text-xs font-semibold px-3 py-1">
                      {activeImg + 1}/{images.length}
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white rounded-full p-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white rounded-full p-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 px-5 py-4 overflow-x-auto bg-[#FAF7F4] border-t border-gray-200/70">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${i === activeImg ? 'border-brand-500 ring-2 ring-brand-500 ring-offset-2' : 'border-transparent hover:border-gray-300'}`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-2xl sm:text-3xl font-semibold text-brand-600 tabular-nums">
                        {formatPrice(property.price)}
                        {property.priceUnit === 'per_month' && <span className="text-sm font-normal text-gray-500">/mo</span>}
                      </p>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">{property.title}</h1>
                      <p className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {property.location?.locality || property.location?.city || 'Vadodara'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent-500 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded px-3 py-1.5 border border-gray-200/80 bg-white/80"
                        aria-label="Share this property"
                      >
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-200/70">
                    {property.bedrooms > 0 && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em]">Bedrooms</div>
                        <div className="mt-2 flex items-center gap-2 text-gray-700 text-sm">
                          <BedDouble className="w-5 h-5 text-accent-500" />
                          <span className="text-lg font-semibold">{property.bedrooms}</span>
                          <span className="text-gray-400">bed</span>
                        </div>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em]">Bathrooms</div>
                        <div className="mt-2 flex items-center gap-2 text-gray-700 text-sm">
                          <Bath className="w-5 h-5 text-accent-500" />
                          <span className="text-lg font-semibold">{property.bathrooms}</span>
                          <span className="text-gray-400">bath</span>
                        </div>
                      </div>
                    )}
                    {property.area > 0 && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em]">Area</div>
                        <div className="mt-2 flex items-center gap-2 text-gray-700 text-sm">
                          <Maximize2 className="w-5 h-5 text-accent-500" />
                          <span className="text-lg font-semibold">{property.area}</span>
                          <span className="text-gray-400">sqft</span>
                        </div>
                      </div>
                    )}
                    <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em]">Type</div>
                      <div className="mt-2 flex items-center gap-2 text-gray-700 text-sm">
                        <Tag className="w-5 h-5 text-accent-500" />
                        <span className="text-lg font-semibold capitalize">{property.type}</span>
                      </div>
                    </div>
                    {property.createdAt && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em]">Listed</div>
                        <div className="mt-2 flex items-center gap-2 text-gray-700 text-sm">
                          <Calendar className="w-5 h-5 text-accent-500" />
                          <span className="text-base font-semibold">
                            {new Date(property.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {property.description && (
                    <div>
                      <h2 className="font-semibold text-xl text-gray-900 mb-3">Description</h2>
                      <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{descriptionPreview}</p>
                      {isLocked && (
                        <p className="mt-3 text-sm text-gray-400">
                          Log in to view the full description.
                        </p>
                      )}
                    </div>
                  )}

                  {amenitiesPreview.length > 0 && (
                    <div>
                      <h2 className="font-semibold text-xl text-gray-900 mb-4">Amenities</h2>
                      <div className="flex flex-wrap gap-3">
                        {amenitiesPreview.map((a) => (
                          <span key={a} className="bg-brand-100 text-brand-600 text-sm px-4 py-2 rounded-full font-semibold">{a}</span>
                        ))}
                      </div>
                      {isLocked && (
                        <p className="mt-3 text-sm text-gray-400">
                          Log in to see all amenities.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </m.div>

              <m.div {...reveal} className="bg-white rounded-[28px] border border-gray-200/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] overflow-hidden">
                <div className="p-6 border-b border-gray-200/70 bg-[#FAF7F4]">
                  <h2 className="font-semibold text-xl text-gray-900">Location</h2>
                  {!isLocked && property.location?.address && (
                    <p className="text-sm text-gray-500 mt-1">{property.location.address}</p>
                  )}
                </div>
                <div className="h-64 sm:h-80 relative">
                  {isLocked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center px-6">
                        <p className="text-sm text-gray-500">Log in to view the exact map location.</p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                          <Link
                            to="/login"
                            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold"
                          >
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-white"
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker position={[lat, lng]}>
                        <Popup>{property.title}</Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              </m.div>
            </div>

            <div className="lg:w-96 shrink-0 w-full">
               <m.div className="bg-white rounded-[28px] border border-gray-200/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] p-6 sm:p-8 lg:sticky lg:top-20">
                <div className="rounded-2xl bg-[#FAF7F4] border border-gray-200/70 px-4 py-3 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg text-gray-900">Interested? Contact Us</h2>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-600">Priority</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">We usually respond within a few hours.</p>
                </div>
                {isLocked ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Log in to contact the agent and view full details.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <Link
                        to="/login"
                        className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-white"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleInquiry} className="space-y-4">
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your Name *"
                        className="w-full border border-gray-200/80 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
                        name="name"
                        autoComplete="name"
                      />
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="Email Address *"
                        className="w-full border border-gray-200/80 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
                        name="email"
                        autoComplete="email"
                      />
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone Number *"
                        className="w-full border border-gray-200/80 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 bg-white"
                        name="phone"
                        autoComplete="tel"
                      />
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Hi, I'm interested in this property. Please contact me."
                        className="w-full border border-gray-200/80 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 resize-none bg-white"
                        name="message"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_16px_40px_-20px_rgba(255,122,0,0.7)] hover:shadow-[0_18px_45px_-18px_rgba(255,122,0,0.8)]"
                      >
                        {submitting ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Mail className="w-5 h-5" />
                        )}
                        {submitting ? 'Sending...' : 'Send Inquiry'}
                      </button>
                    </form>

                    <a
                      href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in "${property.title}" - ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Phone className="w-5 h-5" /> WhatsApp Us
                    </a>
                  </>
                )}
              </m.div>
            </div>
          </div>
        </m.div>

        {!isLocked && relatedProperties.length > 0 && (
          <m.section {...reveal} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="bg-white rounded-[28px] border border-white/80 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Related Properties</h2>
                  <p className="text-sm text-gray-500">Based on this listing</p>
                </div>
                <Link to="/properties" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProperties.map((item) => (
                  <PropertyCard key={item.id} property={item} />
                ))}
              </div>
            </div>
          </m.section>
        )}
      </m.main>
      </LazyMotion>
      <Footer />
    </>
  );
}
