import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Menu,
  X,
  Tags
} from 'lucide-react';
import { useState } from 'react';

/**
 * Admin navigation sidebar links
 */
import { useAuthStore } from '@/stores';

const adminNavLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Sản phẩm', path: '/admin/products', icon: Package },
  { name: 'Danh mục', path: '/admin/categories', icon: Tags },
  { name: 'Đơn hàng', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Người dùng', path: '/admin/users', icon: Users },
];

/**
 * AdminLayout Component
 * 
 * Minimal layout for admin/management pages.
 * Features:
 * - Collapsible sidebar navigation
 * - No public Header/Footer (tối giản as required)
 * - Responsive design for mobile admin access
 * 
 * Used for routes:
 * - /admin (Dashboard)
 * - /admin/products (Product management)
 * - /admin/orders (Order management)
 * - /admin/users (User management)
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        {/* Admin Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-de-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌿</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-de-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-de-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌿</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-de-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Mobile */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <span className="ml-4 text-lg font-semibold text-gray-900">Admin Panel</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
