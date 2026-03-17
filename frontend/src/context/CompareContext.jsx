import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [selectedProperties, setSelectedProperties] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compare_properties');
    if (saved) {
      try {
        setSelectedProperties(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved compare properties', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('compare_properties', JSON.stringify(selectedProperties));
  }, [selectedProperties]);

  const toggleProperty = (property) => {
    setSelectedProperties((prev) => {
      const isSelected = prev.find((p) => p.id === property.id);
      if (isSelected) {
        toast.success('Removed from comparison');
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 4) {
        toast.error('You can only compare up to 4 properties');
        return prev;
      }
      toast.success('Added to comparison');
      return [...prev, property];
    });
  };

  const removeProperty = (id) => {
    setSelectedProperties((prev) => prev.filter((p) => p.id !== id));
    toast.success('Removed from comparison');
  };

  const clearCompare = () => {
    setSelectedProperties([]);
    toast.success('Comparison cleared');
  };

  return (
    <CompareContext.Provider value={{ 
      selectedProperties, 
      toggleProperty, 
      removeProperty, 
      clearCompare,
      isFull: selectedProperties.length >= 4
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
