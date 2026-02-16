import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import categoryService from '@/api/categoryService';
import { X, Check } from 'lucide-react';

/**
 * ProductFilters Component
 * 
 * Handles filtering by Category, Price range, Stock status, and Sorting.
 * Syncs usage with URL search params.
 */
const ProductFilters = ({ className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  
  // Local state for filters to allow "Apply" or direct sync
  // For better UX with sliders/inputs, we might want debouncing or a button, 
  // but for simplicity here we'll sync on change/blur where appropriate.
  
  useEffect(() => {
    // Fetch categories for the filter list
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCats();
  }, []);

  const currentCategory = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || ''; // 'price-asc', 'price-desc', 'name', 'newest'

  // Update URL helpers
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Check page param reset if needed? Usually good to go back to page 1 on filter
    setSearchParams(newParams);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Clear Filters */}
      {(currentCategory || minPrice || maxPrice || inStock) && (
        <button 
          onClick={() => setSearchParams({})}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}

      {/* Sort By */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Sort By</h3>
        <select 
          value={sort} 
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-de-primary"
        >
          <option value="">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="createdAt_desc">Newest Arrivals</option>
        </select>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Category</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="category"
              checked={currentCategory === ''} 
              onChange={() => updateParam('category', '')}
              className="accent-de-primary" 
            />
            <span className={`text-sm ${currentCategory === '' ? 'text-de-primary font-medium' : 'text-gray-600 group-hover:text-de-primary'}`}>
              All Categories
            </span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={currentCategory === String(cat.id)} 
                onChange={() => updateParam('category', cat.id)}
                className="accent-de-primary"
              />
              <span className={`text-sm ${currentCategory === String(cat.id) ? 'text-de-primary font-medium' : 'text-gray-600 group-hover:text-de-primary'}`}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Price Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-secondary-custom mb-1 block">Min</label>
            <input 
              type="number" 
              placeholder="0" 
              value={minPrice}
              onChange={(e) => updateParam('minPrice', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md text-sm focus:border-de-primary focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-secondary-custom mb-1 block">Max</label>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md text-sm focus:border-de-primary focus:outline-none"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Availability */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${inStock ? 'bg-de-primary border-de-primary' : 'border-gray-300'}`}>
            {inStock && <Check className="w-3 h-3 text-white" />}
          </div>
          <input 
            type="checkbox" 
            checked={inStock} 
            onChange={(e) => updateParam('inStock', e.target.checked)}
            className="hidden"
          />
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </div>

    </div>
  );
};

export default ProductFilters;
