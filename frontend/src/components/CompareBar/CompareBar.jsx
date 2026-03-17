import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext.jsx';
import { X, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CompareBar() {
  const { selectedProperties, removeProperty, clearCompare } = useCompare();

  if (selectedProperties.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-2xl"
      >
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {selectedProperties.map((p) => (
                <div key={p.id} className="relative shrink-0 group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                    <img 
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=100&q=80'} 
                      alt={p.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              ))}
              
              {selectedProperties.length < 4 && (
                <div className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 shrink-0">
                  <span className="text-xs font-bold">{selectedProperties.length}/4</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 border-l border-white/10 pl-4 ml-auto">
              <button
                onClick={clearCompare}
                className="hidden sm:block text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors px-2"
              >
                Clear
              </button>
              <Link
                to="/compare"
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span className="hidden xs:inline">Compare</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
