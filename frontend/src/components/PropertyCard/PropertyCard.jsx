import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2, Share2, Star } from 'lucide-react';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&q=80';

export default function PropertyCard({ property, style }) {
  const {
    id, title, price, priceUnit, bedrooms, bathrooms, area,
    location, images, type, intent, featured,
  } = property;

  const thumb = images?.[0] || PLACEHOLDER;
  const intentLabel = intent === 'rent' ? 'For Rent' : intent === 'commercial' ? 'Commercial' : 'For Sale';
  const locationLabel = location?.locality || location?.city || 'Vadodara';

  const formatPrice = (n) => {
    if (n >= 10_000_000) return `Rs ${(n / 10_000_000).toFixed(1)} Cr`;
    if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(1)} L`;
    return `Rs ${n.toLocaleString('en-IN')}`;
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/properties/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore share errors
    }
  };

  return (
     <Link
      to={`/properties/${id}`}
      className="block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      style={style}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={thumb}
          alt={title}
          loading="lazy"
          decoding="async"
          width="800"
          height="500"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {featured && (
          <span className="absolute top-4 left-4 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
            <Star className="w-3 h-3" aria-hidden="true" /> Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <p className="text-brand-500 font-semibold text-lg tabular-nums">
          {formatPrice(price)}
          {priceUnit === 'per_month' && <span className="text-sm font-normal text-gray-500">/mo</span>}
        </p>
        {area > 0 && price > 0 && (
          <p className="text-xs text-gray-400 -mt-1">
            {`Rs ${Math.round(price / area).toLocaleString('en-IN')}/sqft`}
          </p>
        )}
        <h3 className="font-semibold text-gray-900 text-lg leading-snug text-balance">{title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{locationLabel}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm pt-3 border-t border-gray-200/70">
          {bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" aria-hidden="true" /> {bedrooms} bed</span>
          )}
          {bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath className="w-4 h-4" aria-hidden="true" /> {bathrooms} bath</span>
          )}
          {area > 0 && (
            <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" aria-hidden="true" /> {area} sqft</span>
          )}
        </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{intentLabel}</span>
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            aria-label="Share property"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Link>
  );
}
