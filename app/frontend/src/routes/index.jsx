import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout, AdminLayout, AuthLayout } from '@/layouts';

// Public pages
import HomePage from '@/pages/home/HomePage';
import ProductListPage from '@/pages/product/ProductListPage';
import ProductDetailPage from '@/pages/product/ProductDetailPage';
import CartPage from '@/pages/cart/CartPage';
import CheckoutPage from '@/pages/checkout/CheckoutPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';

/**
 * Application Routes Configuration
 * 
 * B2C E-commerce flow - Public routes:
 * / - Home page with featured products
 * /products - Product listing with filters
 * /products/:id - Product detail page
 * /cart - Shopping cart
 * /checkout - Order & payment page
 * 
 * Auth routes:
 * /auth/login - User login
 * /auth/register - User registration
 * 
 * Admin routes:
 * /admin - Dashboard overview
 * /admin/products - Product management
 * /admin/orders - Order management
 * /admin/users - User management
 */
const router = createBrowserRouter([
  // Public routes - với Header & Footer
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
    ]
  },
  
  // Auth routes - layout riêng cho đăng nhập/đăng ký
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },
  
  // Admin routes - layout tối giản cho quản trị
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'users', element: <AdminUsers /> },
    ]
  },
  
  // 404 Not Found
  {
    path: "*",
    element: <div className="p-8 text-center text-red-500">404 Not Found</div>,
  }
]);

export default router;
