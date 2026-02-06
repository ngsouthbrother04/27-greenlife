import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Loader2 } from 'lucide-react';
import categoryService from '@/api/categoryService';
import { useState, useRef, useEffect } from 'react';

const CategoryMenu = ({ mobile = false, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) return mobile ? null : <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
  if (!categories || categories.length === 0) return null;

  if (mobile) {
    return (
      <div className="space-y-1 pl-4 border-l-2 border-gray-100 ml-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug || cat.id}`}
            onClick={onItemClick}
            className="block py-2 text-[#494961] hover:text-de-primary transition-colors text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1 font-['Poppins'] text-[16px] leading-[24px] font-medium text-[#494961] opacity-70 hover:opacity-100 transition-all"
      >
        Products <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <div 
        className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 transition-all duration-200 z-50 origin-top-left ${
          isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug || cat.id}`}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface-light hover:text-de-primary transition-colors"
          >
            {cat.name}
          </Link>
        ))}
        <div className="border-t border-gray-100 mt-2 pt-2">
           <Link
             to="/products"
             onClick={() => setIsOpen(false)}
             className="block px-4 py-2 text-sm font-medium text-de-primary hover:bg-surface-light"
           >
             View All Products
           </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
