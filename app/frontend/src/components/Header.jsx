import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, Menu, X, Search, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCartStore, useAuthStore } from '@/stores';
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
 * Features:
 * - Responsive Navigation
 * - Cart Badge
 * - Authenticated User Menu (Profile, Logout)
 * - Expandable Search Bar
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  
  // Stores
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Click outside to close menus
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Only close search if it's open and click is outside
        // Optional: you might want search to stay open until closed manually
        // setSearchOpen(false); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0px_3px_5px_0px_rgba(9,30,66,0.2),0px_0px_1px_0px_rgba(9,30,66,0.31)]">
      <div className="container-custom flex h-[92px] items-center justify-between px-4 lg:px-[130px] relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 z-20">
          <div className="h-[60px] relative shrink-0 w-[184px]">
             <img src={logo} alt="Eco Dental" className="object-contain w-full h-full" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!searchOpen && (
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
        )}

        {/* Search Bar - Expandable */}
        <div 
          ref={searchRef}
          className={`hidden lg:flex items-center transition-all duration-300 ${
            searchOpen ? 'flex-1 mx-8 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <SearchBar className="w-full" autoFocus={searchOpen} />
          <button 
            onClick={() => setSearchOpen(false)}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 z-20 bg-white pl-4">
           {/* Search Toggle */}
           <div className="hidden lg:block">
             {!searchOpen && (
               <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#494961] opacity-70 hover:opacity-100 transition-opacity"
               >
                 <Search className="w-6 h-6" />
               </button>
             )}
           </div>

          {/* User Profile / Login */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-light transition-colors text-[#405741]"
            >
               <User className="w-8 h-8" />
            </button>
            
            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animation-fade-in">
                {isAuthenticated() ? (
                  // Authenticated State
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> Edit Profile
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  // Guest State
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Welcome to GreenLife</p>
                    </div>
                    <Link 
                      to="/auth/login" 
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/auth/register" 
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#405741] font-medium hover:bg-gray-50 transition-colors"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

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
        <nav className="lg:hidden border-t border-divider bg-white px-4 py-4 space-y-2 shadow-lg absolute w-full left-0 top-full max-h-[calc(100vh-92px)] overflow-y-auto z-40">
          {/* Mobile Search */}
          <div className="mb-4">
             <SearchBar />
          </div>

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
          
          <div className="border-t border-gray-100 my-2 pt-2">
            {isAuthenticated() ? (
              <>
                 <div className="px-4 py-2">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                 </div>
                 {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 px-4 rounded-lg text-[#494961] hover:bg-surface-light"
                    >
                      Admin Dashboard
                    </Link>
                 )}
                 <button 
                    onClick={handleLogout}
                    className="w-full text-left py-3 px-4 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
              </>
            ) : (
              <Link 
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 rounded-lg text-[#494961] hover:bg-surface-light"
              >
                Login / Register
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
