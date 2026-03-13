import { Star } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
  {
    name: 'Rajesh Patel',
    city: 'Vadodara',
    rating: 5,
    text: 'Found my dream 3BHK in Alkapuri within 3 days! The search filters are excellent and all listings were verified.',
  },
  {
    name: 'Priya Desai',
    city: 'Vadodara',
    rating: 5,
    text: 'The property detail pages have everything - photos, map, area info. Made my decision so much easier.',
  },
  {
    name: 'Aakash Shah',
    city: 'Vadodara',
    rating: 4,
    text: 'Great platform to rent commercial space. The contact form got me a callback in 30 minutes!',
  },
  {
    name: 'Sneha Patel',
    city: 'Vadodara',
    rating: 5,
    text: 'Loved the virtual tour feature! It saved me so much time from visiting properties in person.',
  },
  {
    name: 'Vikram Singh',
    city: 'Vadodara',
    rating: 4,
    text: 'The team was very responsive and helped me find the perfect office space for my startup in Akota.',
  },
  {
    name: 'Ananya Gupta',
    city: 'Vadodara',
    rating: 5,
    text: 'Best real estate platform I\'ve used. The listings are accurate and up-to-date.',
  },
  {
    name: 'Rajesh Kumar',
    city: 'Vadodara',
    rating: 4,
    text: 'Smooth and hassle-free experience. Found my dream home in Gotri without any stress.',
  },
  {
    name: 'Neha Sharma',
    city: 'Vadodara',
    rating: 5,
    text: 'Excellent customer support and easy-to-use interface. Highly recommended!',
  },
];

export default function Testimonials() {
  const [hovering, setHovering] = useState(false);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance mt-3">Trusted by Vadodara Home Seekers</h2>
          <p className="mt-2 text-gray-400 text-sm">Real stories from people who found their property through Property Master Vadodara</p>
        </div>
      </div>

      {/* Infinite scroll marquee (full width) */}
      <div
        className="relative overflow-hidden w-full group"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-gray-50 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-gray-50 to-transparent pointer-events-none z-10" />
        <div
          className="flex animate-infinite-scroll gap-5 pl-5 group-hover:[animation-play-state:paused]"
          style={{ animationPlayState: hovering ? 'paused' : 'running' }}
        >
          {[...testimonials, ...testimonials].map(({ name, city, rating, text }, index) => (
            <div
              key={`${name}-${index}`}
              className="bg-white border border-gray-100 rounded-2xl p-6 min-w-85 max-w-100 space-y-4 shrink-0 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? 'fill-brand-500 text-brand-500' : 'fill-gray-200 text-gray-200'}`}
                    aria-hidden="true"
                  />
                ))}
                <span className="sr-only">{rating} out of 5 stars</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">"{text}"</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{name}</div>
                  <div className="text-gray-400 text-xs">{city}</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

