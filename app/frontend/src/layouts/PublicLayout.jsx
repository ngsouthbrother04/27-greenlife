import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * PublicLayout Component
 * 
 * Layout wrapper for all public-facing pages in the B2C e-commerce flow.
 * Includes:
 * - Header with navigation and cart
 * - Main content area (Outlet for child routes)
 * - Footer with links and newsletter
 * 
 * Used for routes:
 * - / (Home)
 * - /products (Product listing)
 * - /products/:id (Product detail)
 * - /cart (Shopping cart)
 * - /checkout (Checkout page)
 */
const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with navigation */}
      <Header />

      {/* Main Content - renders child routes */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
