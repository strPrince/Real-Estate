import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import './FloorPlansSection.css';
import floorPlanPlaceholder from '../../assets/floor-plan-placeholder.png';

const DOT_COLORS = ['dot-orange', 'dot-blue', 'dot-green', 'dot-purple', 'dot-rose', 'dot-teal'];

const formatPrice = (n) => {
  if (!n && n !== 0) return 'Price on request';
  if (n >= 10_000_000) return `₹ ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹ ${(n / 100_000).toFixed(2)} L`;
  return `₹ ${Number(n).toLocaleString('en-IN')}`;
};

const sqftToSqm = (sqft) => (sqft * 0.092903).toFixed(2);

export default function FloorPlansSection({ floorPlans = [], propertyId }) {
  const [activeTab, setActiveTab] = useState('All');

  if (!floorPlans.length) return null;

  // Gather unique BHK types
  const bhkTypes = [...new Set(floorPlans.map((fp) => fp.bhk).filter(Boolean))];
  const tabs = ['All', ...bhkTypes];

  const filtered = activeTab === 'All'
    ? floorPlans
    : floorPlans.filter((fp) => fp.bhk === activeTab);

  return (
    <div className="floor-plans-section">
      <div className="floor-plans-header">
        <h2>Floor Plans & Pricing</h2>
        <p className="floor-plans-count">
          <strong>{filtered.length}</strong> Floor Plan{filtered.length !== 1 ? 's' : ''} Available
        </p>
      </div>

      {bhkTypes.length > 1 && (
        <div className="floor-plans-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`fp-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'All' ? 'All Types' : tab}
            </button>
          ))}
        </div>
      )}

      <div className="floor-plans-cards">
        {filtered.map((fp, index) => {
          const realIndex = floorPlans.indexOf(fp);
          return (
            <Link
              key={index}
              to={`/properties/${propertyId}/floor-plans/${realIndex}`}
              className="fp-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="fp-card-head">
                <span className={`fp-card-dot ${DOT_COLORS[index % DOT_COLORS.length]}`} />
                <div>
                  <div className="fp-card-area">
                    {fp.carpetArea ? `${fp.carpetArea} ${fp.areaUnit || 'sq.ft.'}` : 'Area N/A'}
                    {fp.carpetArea && (
                      <span className="fp-card-area-sqm">
                        {' '}({sqftToSqm(fp.carpetArea)} sq.m.)
                      </span>
                    )}
                  </div>
                  <div className="fp-card-bhk">
                    {fp.bhk ? `Carpet Area | ${fp.bhk}` : 'Carpet Area'}
                  </div>
                </div>
              </div>
              <img
                src={fp.image || floorPlanPlaceholder}
                alt={fp.label || 'Floor Plan'}
                className="fp-card-image"
                onError={(e) => { e.target.src = floorPlanPlaceholder; }}
              />
              <div className="fp-card-footer">
                <div className="fp-card-price">
                  {fp.price ? (
                    <>
                      <span className="rupee">₹</span>
                      {formatPrice(fp.price).replace('₹ ', '')}
                    </>
                  ) : (
                    'Price on request'
                  )}
                </div>
                <div className="fp-card-bottom-row">
                  {fp.status && (
                    <div className="fp-card-status">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                      {fp.status}
                    </div>
                  )}
                  <span className="fp-card-view-link">
                    View Details <ExternalLink style={{ width: 11, height: 11, display: 'inline', verticalAlign: 'middle' }} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
