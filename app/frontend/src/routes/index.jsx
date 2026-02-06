import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout, AdminLayout, AuthLayout } from '@/layouts';
import PrivateRoute from '@/components/PrivateRoute';

// Public pages
import HomePage from '@/pages/home/HomePage';
import ProductListPage from '@/pages/product/ProductListPage';
import ProductDetailPage from '@/pages/product/ProductDetailPage';
import CartPage from '@/pages/cart/CartPage';
import CheckoutPage from '@/pages/checkout/CheckoutPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// User pages
import ProfilePage from '@/pages/profile/ProfilePage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminCategories from '@/pages/admin/AdminCategories';

/**
 * Application Routes Configuration
 */
const router = createBrowserRouter([
  // Public routes
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
  
  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      // Redirect /auth to /auth/login
      { index: true, element: <Navigate to="/auth/login" replace /> }
    ]
  },
  
  // Protected User Routes
  {
    element: <PrivateRoute />, // Protects routes for ANY authenticated user
    children: [
      {
         element: <PublicLayout />, // Re-use Public Layout (Header/Footer)
         children: [
           { path: '/profile', element: <ProfilePage /> },
         ]
      }
    ]
  },

  // Admin routes - Protected
  {
    path: '/admin',
    element: <PrivateRoute allowedRoles={['admin']} />, // Protect all admin routes
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'categories', element: <AdminCategories /> },
          { path: 'orders', element: <AdminOrders /> },
          { path: 'users', element: <AdminUsers /> },
        ]
      }
    ]
  },
  
  // 404 Not Found
  {
    path: "*",
    element: <div className="p-8 text-center text-red-500">404 Not Found</div>,
  }
]);

export default router;
