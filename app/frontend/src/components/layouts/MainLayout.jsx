import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">GreenLife</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Sản phẩm
              </Link>
              <Link to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Về chúng tôi
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent rounded-full text-foreground/60">
              <Search className="h-5 w-5" />
            </button>
            <Link to="/cart" className="relative p-2 hover:bg-accent rounded-full text-foreground/60">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </Link>
            <Link to="/auth/login" className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              Đăng nhập
            </Link>
            <button className="md:hidden p-2 hover:bg-accent rounded-md">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">GreenLife</h3>
            <p className="text-sm text-muted-foreground">
              Giải pháp xanh cho doanh nghiệp của bạn. Sản phẩm thân thiện môi trường, chất lượng cao.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products">Sản phẩm</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Chính sách</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/policy/shipping">Giao hàng</Link></li>
              <li><Link to="/policy/return">Đổi trả</Link></li>
              <li><Link to="/policy/privacy">Bảo mật</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <p className="text-sm text-muted-foreground">
              Email: contact@greenlife.vn<br />
              Hotline: 1900 1234
            </p>
          </div>
        </div>
        <div className="border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GreenLife Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
