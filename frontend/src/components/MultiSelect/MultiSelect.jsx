import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export default function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select options...',
  label = '',
  loading = false,
  error = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const removeOption = (option, e) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
          {label}
        </label>
      )}
      
      <div
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full border border-gray-200 rounded-xl px-3 py-1.5 flex flex-wrap gap-2 items-center bg-white cursor-pointer transition-all ${
          isOpen ? 'border-brand-500 ring-2 ring-brand-500/10' : 'hover:border-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">{loading ? 'Loading...' : placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium border border-brand-100"
              >
                {item}
                <button
                  onClick={(e) => removeOption(item, e)}
                  className="p-0.5 hover:bg-brand-100 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          {selected.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-brand-50 text-brand-700 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {error && <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>}
    </div>
  );
}
