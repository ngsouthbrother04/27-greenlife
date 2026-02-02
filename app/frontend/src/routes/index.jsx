import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import HomePage from '@/pages/home/HomePage';
import ProductListPage from '@/pages/product/ProductListPage';
import ProductDetailPage from '@/pages/product/ProductDetailPage';
import CartPage from '@/pages/cart/CartPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

/**
 * Application Routes Configuration
 * 
 * B2C E-commerce flow:
 * / - Home page with featured products
 * /products - Product listing with filters
 * /products/:id - Product detail page
 * /cart - Shopping cart
 * /auth/login - User login
 * /auth/register - User registration
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },
  {
    path: "*",
    element: <div className="p-8 text-center text-red-500">404 Not Found</div>,
  }
]);

export default router;
