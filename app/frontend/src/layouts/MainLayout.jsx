import { Outlet, Link, NavLink } from 'react-router-dom';
import { ShoppingCart, MapPin, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Teeth Whitening', path: '/products?category=whitening', hasDropdown: true },
  { name: 'Mouthpiece', path: '/products?category=mouthpiece', hasDropdown: true },
  { name: 'Mouthwash', path: '/products?category=mouthwash', hasDropdown: true },
];

const footerLinks = {
  quickLinks: [
    { name: 'Our Story', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Shipping & Delivery', path: '/shipping' },
  ],
  social: [
    { name: 'Facebook', icon: 'f' },
    { name: 'Instagram', icon: 'in' },
    { name: 'Pinterest', icon: 'p' },
    { name: 'Twitter', icon: 't' },
  ],
};

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get cart items count from Zustand store
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-divider">
        <div className="container-custom flex h-[92px] items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-de-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌿</span>
            </div>
            <div>
              <span className="text-xl font-bold text-de-primary">Eco Dental</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-1 paragraph-1-medium transition-colors ${
                    isActive ? 'text-de-primary' : 'text-secondary-custom hover:text-de-primary'
                  }`
                }
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-light rounded-full transition-colors">
              <MapPin className="w-5 h-5 text-secondary-custom" />
            </button>
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-surface-light rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-secondary-custom" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-de-primary text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-surface-light rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-secondary-custom" />
              ) : (
                <Menu className="w-6 h-6 text-secondary-custom" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-divider bg-white px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-3 px-4 rounded-lg paragraph-1-medium transition-colors ${
                    isActive ? 'bg-surface-light text-de-primary' : 'text-secondary-custom hover:bg-surface-light'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-de-primary text-white">
        <div className="container-custom py-16">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-de-primary font-bold text-lg">🌿</span>
                </div>
                <span className="text-xl font-bold">Eco Dental</span>
              </div>
              <p className="paragraph-1 opacity-80">
                Eco Dental is your go-to destination for premium natural oral care products. 
                We are dedicated to providing you with a holistic approach to dental hygiene, 
                harnessing the power of nature to promote a healthy smile.
              </p>
              
              {/* Social Icons */}
              <div className="flex gap-3 pt-4">
                {['f', 'in', 'p', 't'].map((icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <span className="text-sm font-medium">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="subtitle-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="paragraph-1 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="subtitle-semibold mb-6">Receive offers & discounts via e-mail</h4>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
                  <input 
                    type="email"
                    placeholder="Enter Email"
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>
                <button className="px-6 py-3 bg-white text-de-primary font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10">
          <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="paragraph-2 opacity-60">
              © 2024 Eco Dental™. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/terms" className="paragraph-2 opacity-60 hover:opacity-100 transition-opacity">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="paragraph-2 opacity-60 hover:opacity-100 transition-opacity">
                Privacy Policy
              </Link>
              <Link to="/refund" className="paragraph-2 opacity-60 hover:opacity-100 transition-opacity">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
