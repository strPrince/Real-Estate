import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import {
  MapPin, BedDouble, Bath, Maximize2, Tag, Calendar,
  ChevronLeft, ChevronRight, Phone, Mail, Share2, ArrowLeft, Ruler, Layers, IndianRupee, Sparkles
} from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';
import PropertyCard from '../../components/PropertyCard/PropertyCard.jsx';
import { getCachedProperties, getProperty, submitInquiry, submitQuery } from '../../api.js';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import MathCaptcha from '../../components/MathCaptcha/MathCaptcha.jsx';
import FloorPlansSection from '../../components/FloorPlans/FloorPlansSection.jsx';
import floorPlanPlaceholder from '../../assets/floor-plan-placeholder.png';
import localities from '../../data/localities.json';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0])) {
      map.setView(center, map.getZoom());
    }
  }, [center?.[0], center?.[1], map]);
  return null;
}

const PLACEHOLDER_IMAGES = [
  floorPlanPlaceholder,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
];

const sqftToSqm = (sqft) => (sqft * 0.092903).toFixed(2);

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const toFiniteNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getRelativeDiff = (a, b) => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.abs(a - b) / Math.max(Math.abs(b), 1);
};

const toRad = (deg) => (deg * Math.PI) / 180;

const getDistanceKm = (first, second) => {
  const lat1 = toFiniteNumber(first?.lat ?? first?.[0]);
  const lng1 = toFiniteNumber(first?.lng ?? first?.[1]);
  const lat2 = toFiniteNumber(second?.lat ?? second?.[0]);
  const lng2 = toFiniteNumber(second?.lng ?? second?.[1]);
  if (lat1 === null || lng1 === null || lat2 === null || lng2 === null) return null;

  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = (
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  );

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
};

const hasTokenOverlap = (left, right) => {
  const leftTokens = normalizeText(left).split(/[\s,/-]+/).filter(Boolean);
  const rightTokens = normalizeText(right).split(/[\s,/-]+/).filter(Boolean);
  if (!leftTokens.length || !rightTokens.length) return false;
  const rightSet = new Set(rightTokens);
  return leftTokens.some((token) => rightSet.has(token));
};

const getRelatedProperties = (current, list) => {
  if (!current || !Array.isArray(list)) return [];

  const currentLocality = normalizeText(current.location?.locality);
  const currentCity = normalizeText(current.location?.city);
  const currentType = normalizeText(current.type || current.propertyType);
  const currentIntent = normalizeText(current.intent);
  const currentBedrooms = toFiniteNumber(current.bedrooms);
  const currentBathrooms = toFiniteNumber(current.bathrooms);
  const currentPrice = toFiniteNumber(current.price);
  const currentArea = toFiniteNumber(current.area);
  const currentPriceUnit = normalizeText(current.priceUnit);

  const scored = list
    .filter((item) => item?.id && item.id !== current.id)
    .map((item) => {
      const itemLocality = normalizeText(item.location?.locality);
      const itemCity = normalizeText(item.location?.city);
      const itemType = normalizeText(item.type || item.propertyType);
      const itemIntent = normalizeText(item.intent);
      const itemBedrooms = toFiniteNumber(item.bedrooms);
      const itemBathrooms = toFiniteNumber(item.bathrooms);
      const itemPrice = toFiniteNumber(item.price);
      const itemArea = toFiniteNumber(item.area);
      const itemPriceUnit = normalizeText(item.priceUnit);

      let score = 0;
      let localityRank = 0;

      const sameLocality = currentLocality && itemLocality && currentLocality === itemLocality;
      const nearLocality = !sameLocality
        && currentLocality
        && itemLocality
        && (
          currentLocality.includes(itemLocality)
          || itemLocality.includes(currentLocality)
          || hasTokenOverlap(currentLocality, itemLocality)
        );
      const sameCity = currentCity && itemCity && currentCity === itemCity;

      if (sameLocality) {
        score += 40;
        localityRank = 3;
      } else if (nearLocality) {
        score += 26;
        localityRank = 2;
      } else if (sameCity) {
        score += 12;
        localityRank = 1;
      }

      if (currentType && itemType && currentType === itemType) score += 12;
      if (currentIntent && itemIntent && currentIntent === itemIntent) score += 10;
      if (currentPriceUnit && itemPriceUnit && currentPriceUnit === itemPriceUnit) score += 2;

      if (currentBedrooms !== null && itemBedrooms !== null) {
        const diff = Math.abs(itemBedrooms - currentBedrooms);
        if (diff === 0) score += 6;
        else if (diff === 1) score += 3;
      }

      if (currentBathrooms !== null && itemBathrooms !== null) {
        const diff = Math.abs(itemBathrooms - currentBathrooms);
        if (diff === 0) score += 4;
        else if (diff === 1) score += 2;
      }

      const priceDiffRatio = getRelativeDiff(itemPrice, currentPrice);
      if (priceDiffRatio !== null) {
        if (priceDiffRatio <= 0.15) score += 10;
        else if (priceDiffRatio <= 0.3) score += 6;
        else if (priceDiffRatio <= 0.5) score += 3;
      }

      const areaDiffRatio = getRelativeDiff(itemArea, currentArea);
      if (areaDiffRatio !== null) {
        if (areaDiffRatio <= 0.15) score += 6;
        else if (areaDiffRatio <= 0.3) score += 4;
        else if (areaDiffRatio <= 0.5) score += 2;
      }

      const distanceKm = getDistanceKm(item.location, current.location);
      if (distanceKm !== null) {
        if (distanceKm <= 2) score += 16;
        else if (distanceKm <= 5) score += 12;
        else if (distanceKm <= 10) score += 7;
        else if (distanceKm <= 20) score += 3;
      }

      return {
        item,
        score,
        localityRank,
        distanceKm: distanceKm ?? Number.MAX_SAFE_INTEGER,
        priceDiff: Number.isFinite(itemPrice) && Number.isFinite(currentPrice)
          ? Math.abs(itemPrice - currentPrice)
          : Number.MAX_SAFE_INTEGER,
      };
    });

  const rankedBySignal = scored.filter((entry) => entry.score > 0);
  const ranked = rankedBySignal.length ? rankedBySignal : scored;

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.localityRank !== a.localityRank) return b.localityRank - a.localityRank;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    if (a.priceDiff !== b.priceDiff) return a.priceDiff - b.priceDiff;
    return String(a.item.id).localeCompare(String(b.item.id));
  });

  return ranked.map((entry) => entry.item);
};

export default function FloorPlanDetailPage() {
  const { id, planIndex } = useParams();
  const idx = parseInt(planIndex) || 0;
  
  const { currentUser } = useAuth();
  const isLocked = !currentUser;
  
  const [property, setProperty] = useState(null);
  const [mapCoords, setMapCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const captchaRef = useRef();

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!property) return;
    const localityData = property?.location ? localities.find(l => 
      l.name.toLowerCase() === (property.location.locality || '').toLowerCase() || 
      l.name.toLowerCase() === (property.location.city || '').toLowerCase()
    ) : null;
    const fallbackLat = localityData?.lat || 22.3072;
    const fallbackLng = localityData?.lng || 73.1812;

    if (property.location?.lat && property.location?.lng) {
      setMapCoords([property.location.lat, property.location.lng]);
    } else if (property.location?.address || property.location?.locality) {
      const city = property.location?.city || 'Vadodara';
      const locality = property.location?.locality || '';
      const address = property.location?.address || '';

      const queriesToTry = [];
      if (address) {
         let fullAddr = address;
         if (!/vadodara|baroda/i.test(fullAddr)) fullAddr += `, ${city}`;
         queriesToTry.push(fullAddr);
      }
      if (locality) {
         queriesToTry.push(`${locality}, ${city}`);
      }

      const tryGeocode = async (queries) => {
        if (queries.length === 0) return null;
        const queryStr = queries[0];
        const query = encodeURIComponent(queryStr);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${query}`);
          const data = await res.json();
          if (data && data.length > 0) {
            const resultName = (data[0].display_name || '').toLowerCase();
            if (resultName.includes('vadodara') || resultName.includes('baroda') || resultName.includes('gujarat')) {
              return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        }
        return tryGeocode(queries.slice(1));
      };

      tryGeocode(queriesToTry).then(coords => {
        setMapCoords(coords || [fallbackLat, fallbackLng]);
      });
    } else {
      setMapCoords([fallbackLat, fallbackLng]);
    }
  }, [property]);

  const pageMotion = {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      };

  const reveal = {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
      };

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    getProperty(id)
      .then((data) => {
        setProperty(data);
        const planName = data.floorPlans?.[idx]?.label || 'Floor Plan';
        document.title = `${planName} - ${data.title} - Property Master Vadodara`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
          meta.setAttribute('content', `Details and specifications for ${planName} at ${data.title} in Vadodara.`);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, idx]);

  async function handleInquiry(e) {
    e.preventDefault();

    if (!captchaRef.current.validate()) {
      return;
    }

    setSubmitting(true);
    const planName = property.floorPlans?.[idx]?.label || `Floor Plan ${idx + 1}`;
    
    try {
      if (property.userId) {
        await submitQuery({
          ...form,
          propertyId: id,
          propertyTitle: `${property.title} - ${planName}`,
          ownerId: property.userId,
        });
      } else {
        await submitInquiry({
          ...form,
          propertyId: id,
          propertyTitle: `${property.title} - ${planName}`,
          propertyLink: `${window.location.origin}/properties/${id}/floor-plans/${idx}`,
        });
      }
      toast.success('Inquiry sent! We will contact you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
      captchaRef.current.reset();
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
    if (!n && n !== 0) return 'Price on request';
    if (n >= 10_000_000) return `₹ ${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000) return `₹ ${(n / 100_000).toFixed(2)} L`;
    return `₹ ${Number(n).toLocaleString('en-IN')}`;
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

  const plan = property?.floorPlans?.[idx];

  if (error || !plan) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-[#F7F4F1]">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-gray-700">Floor plan not found</p>
          <Link to={`/properties/${id}`} className="text-brand-500 hover:underline font-medium">
            ← Back to property
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );

  const images = plan.image ? [plan.image, ...PLACEHOLDER_IMAGES] : PLACEHOLDER_IMAGES;
  
  const lat = mapCoords?.[0] || property?.location?.lat || 22.3072;
  const lng = mapCoords?.[1] || property?.location?.lng || 73.1812;
  const relatedProperties = getRelatedProperties(property, getCachedProperties()).slice(0, 3);
  const descriptionPreview = isLocked && property.description
    ? `${property.description.split(/\\s+/).slice(0, 40).join(' ')}...`
    : property.description;
    
  const amenities = Array.from(new Set([
    ...(plan.amenities || []),
    ...(property?.amenities || [])
  ]));
  
  const amenitiesPreview = isLocked
    ? amenities.slice(0, 3)
    : amenities;

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.main {...pageMotion} className="pb-20 bg-[#F7F4F1]">
        <m.div {...reveal} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="inline-flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] font-semibold text-gray-500 bg-white/70 border border-white/80 px-3 py-2 rounded-full shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]">
              <Link to="/" className="hover:text-accent-500">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/properties/${id}`} className="hover:text-accent-500 truncate max-w-[120px]">{property.title}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-800 truncate max-w-[150px] sm:max-w-none">{plan.label || 'Floor Plan'}</span>
            </div>
            <Link
              to={`/properties/${id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-500 transition-colors bg-white/70 border border-white/80 px-4 py-2 rounded-full shadow-sm w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Main Property
            </Link>
          </div>
        </m.div>

        <m.div {...reveal} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 min-w-0 space-y-8">
              <m.div className="bg-white rounded-[30px] overflow-hidden border border-white/80 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)]">
                <div className="relative h-72 sm:h-96 md:h-[520px] bg-gray-50">
                  <img
                    src={images[activeImg]}
                    alt={plan.label || 'Floor Plan'}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGES[0]; }}
                  />
                  {plan.status && (
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-green-600 shadow-sm border border-green-100">
                      {plan.status}
                    </div>
                  )}
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
                        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_IMAGES[0]; }} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-2xl sm:text-3xl font-semibold text-brand-600 tabular-nums">
                        {plan.price ? formatPrice(plan.price) : 'Price on request'}
                      </p>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">{plan.label || 'Floor Plan'}</h1>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{property.title}</span>
                        </div>
                        {property.location?.address && (
                          <span className="text-sm">
                            <span className="hidden sm:inline text-gray-400 mr-2">•</span>{property.location.address}
                          </span>
                        )}
                      </div>
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

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-gray-200/70">
                    {plan.carpetArea && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em] font-semibold"><Maximize2 className="w-3 h-3 text-accent-500" /> Carpet Area</div>
                        <div className="mt-2 text-lg font-bold text-gray-900">{plan.carpetArea} <span className="text-sm font-normal text-gray-400">{plan.areaUnit || 'sq.ft.'}</span></div>
                      </div>
                    )}
                    {plan.carpetArea && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em] font-semibold"><Ruler className="w-3 h-3 text-accent-500" /> Area (sq.m.)</div>
                        <div className="mt-2 text-lg font-bold text-gray-900">{sqftToSqm(plan.carpetArea)} <span className="text-sm font-normal text-gray-400">sq.m.</span></div>
                      </div>
                    )}
                    {plan.bhk && (
                      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em] font-semibold"><Layers className="w-3 h-3 text-accent-500" /> Config</div>
                        <div className="mt-2 text-lg font-bold text-gray-900">{plan.bhk}</div>
                      </div>
                    )}
                    <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-[0.22em] font-semibold"><IndianRupee className="w-3 h-3 text-accent-500" /> Price</div>
                      <div className="mt-2 text-[15px] font-bold text-brand-600 line-clamp-1 break-all">
                        {plan.price ? formatPrice(plan.price) : 'Price on request'}
                      </div>
                    </div>
                  </div>

                  {property.description && (
                    <div>
                      <h2 className="font-semibold text-xl text-gray-900 mb-3">About this Property</h2>
                      <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{descriptionPreview}</p>
                      {isLocked ? (
                        <p className="mt-3 text-sm text-gray-400">
                          Log in to view the full description.
                        </p>
                      ) : (
                        <Link to={`/properties/${id}`} className="text-brand-500 hover:text-brand-600 text-sm font-semibold mt-3 inline-block transition-colors">
                          Read full details →
                        </Link>
                      )}
                    </div>
                  )}

                  {typeof plan.otherAmenities === 'string' && plan.otherAmenities.trim() !== '' && (
                    <div>
                      <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Exclusive Floor Plan Amenities
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {plan.otherAmenities.split(',').map((a, idx) => {
                          const amenity = a.trim();
                          if (!amenity) return null;
                          return (
                            <span key={idx} className="bg-purple-50 text-purple-700 text-sm px-4 py-2 rounded-full font-semibold border border-purple-100">
                              {amenity}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {amenitiesPreview.length > 0 && (
                    <div>
                      <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        Amenities
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {amenitiesPreview.map((a) => (
                          <span key={a} className="bg-brand-50 text-brand-600 text-sm px-4 py-2 rounded-full font-semibold border border-brand-100">{a}</span>
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
                  ) : mapCoords ? (
                    <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri"
                      />
                      <MapUpdater center={[lat, lng]} />
                      <Marker position={[lat, lng]}>
                        <Popup>{property.title}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                       <span className="text-sm text-gray-500 font-medium animate-pulse">Loading map location...</span>
                    </div>
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
                  {property.userName && property.userName !== 'Unknown User' && (
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                      Posted by: <span className="text-gray-900">{property.userName}</span>
                    </p>
                  )}
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
                    <form onSubmit={handleInquiry} className="space-y-6">
                      <div className="relative group">
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder=" "
                          className="peer w-full border border-gray-200 rounded-2xl px-4 py-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-white transition-all duration-300 placeholder-transparent"
                          name="name"
                          id="name"
                          autoComplete="name"
                        />
                        <label 
                          htmlFor="name"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-brand-500 peer-focus:tracking-widest"
                        >
                          Your Name *
                        </label>
                      </div>

                      <div className="relative group">
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder=" "
                          className="peer w-full border border-gray-200 rounded-2xl px-4 py-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-white transition-all duration-300 placeholder-transparent"
                          name="email"
                          id="email"
                          autoComplete="email"
                        />
                        <label 
                          htmlFor="email"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-brand-500 peer-focus:tracking-widest"
                        >
                          Email Address *
                        </label>
                      </div>

                      <div className="relative group">
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder=" "
                          className="peer w-full border border-gray-200 rounded-2xl px-4 py-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-white transition-all duration-300 placeholder-transparent"
                          name="phone"
                          id="phone"
                          autoComplete="tel"
                        />
                        <label 
                          htmlFor="phone"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-brand-500 peer-focus:tracking-widest"
                        >
                          Phone Number *
                        </label>
                      </div>

                      <div className="relative group">
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                          placeholder=" "
                          className="peer w-full border border-gray-200 rounded-2xl px-4 py-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 resize-none bg-white transition-all duration-300 placeholder-transparent"
                          name="message"
                          id="message"
                        />
                        <label 
                          htmlFor="message"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-brand-500 peer-focus:tracking-widest"
                        >
                          Message *
                        </label>
                      </div>

                      <MathCaptcha ref={captchaRef} />

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_20px_40px_-15px_rgba(255,122,0,0.5)] hover:shadow-[0_22px_45px_-12px_rgba(255,122,0,0.6)] active:scale-[0.98]"
                      >
                        {submitting ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Mail className="w-5 h-5" />
                        )}
                        {submitting ? 'Sending...' : 'Send Inquiry'}
                      </button>
                    </form>
                  </>
                )}
              </m.div>

              {property?.floorPlans?.length > 1 && (
                <div className="bg-white rounded-[28px] border border-gray-200/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] mt-8 p-6 sm:p-8">
                  <h2 className="font-semibold text-lg text-gray-900 mb-4">Other Floor Plans in {property.title}</h2>
                  <div className="space-y-2">
                    {property.floorPlans.map((fp, i) => {
                      if (i === idx) return null;
                      return (
                        <Link
                          key={i}
                          to={`/properties/${id}/floor-plans/${i}`}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{fp.label || `Floor Plan ${i + 1}`}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {fp.bhk && `${fp.bhk} · `}
                              {fp.carpetArea ? `${fp.carpetArea} ${fp.areaUnit || 'sq.ft.'}` : ''}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-brand-500">
                            {fp.price ? formatPrice(fp.price) : '—'}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
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
