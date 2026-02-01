import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import HomePage from '@/pages/home/HomePage';
import ProductListPage from '@/pages/product/ProductListPage';
import ProductDetailPage from '@/pages/product/ProductDetailPage';
import CartPage from '@/pages/cart/CartPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Define routes
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

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
