import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

/**
 * SearchBar Component
 * 
 * Global search input that redirects to /products with search query.
 */
const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Sync with URL query on mount/update
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    setQuery(currentSearch);
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      // If empty, just go to products or remove search param if already there
      navigate('/products');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-de-primary focus:ring-1 focus:ring-de-primary transition-colors text-sm"
      />
      <button 
        type="submit" 
        className="absolute left-3 text-secondary-custom hover:text-de-primary transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
};

export default SearchBar;
