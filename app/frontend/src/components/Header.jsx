import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores';
import SearchBar from './SearchBar';
import logo from '@/assets/logo.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Teeth Whitening', path: '/products?category=whitening', hasDropdown: true },
  { name: 'Toothpaste', path: '/products?category=toothpaste', hasDropdown: true },
  { name: 'Mouthwash', path: '/products?category=mouthwash', hasDropdown: true },
];

/**
 * Header Component
 * Refactored to match Figma Design:
 * - White background with shadow
 * - Specific padding and layout properties
 * - Updated typography and spacing
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get cart items count from Zustand store
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0px_3px_5px_0px_rgba(9,30,66,0.2),0px_0px_1px_0px_rgba(9,30,66,0.31)]">
      <div className="container-custom flex h-[92px] items-center justify-between px-4 lg:px-[130px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-[60px] relative shrink-0 w-[184px]">
             <img src={logo} alt="Eco Dental" className="object-contain w-full h-full" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 font-['Poppins'] text-[16px] leading-[24px] font-medium transition-colors ${
                  isActive 
                    ? 'text-[#405741] opacity-100' 
                    : 'text-[#494961] opacity-70 hover:opacity-100'
                }`
              }
            >
              {link.name}
              {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
           {/* Search - Visible on Desktop */}
           <div className="hidden lg:block relative">
             <button className="p-2 text-[#494961] opacity-70 hover:opacity-100 transition-opacity">
               <Search className="w-6 h-6" />
             </button>
           </div>

          {/* User Profile */}
          <button className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-light transition-colors text-[#494961]">
             <User className="w-8 h-8" />
          </button>

          {/* Cart */}
          <Link 
            to="/cart" 
            className="relative flex items-center justify-center w-8 h-8 hover:bg-surface-light rounded-full transition-colors text-[#494961]"
          >
            <ShoppingCart className="w-8 h-8" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-de-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-secondary-custom hover:bg-surface-light rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-divider bg-white px-4 py-4 space-y-2 shadow-lg absolute w-full left-0 top-full">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-3 px-4 rounded-lg font-['Poppins'] font-medium transition-colors ${
                  isActive ? 'bg-surface-light text-de-primary' : 'text-[#494961] hover:bg-surface-light'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
