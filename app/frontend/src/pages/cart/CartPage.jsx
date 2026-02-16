import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores';

/**
 * CartPage Component
 * 
 * B2C Flow: User reviews cart before checkout
 * - Data is managed by Zustand global store (not local state)
 * - Cart persists to localStorage via Zustand persist middleware
 * - Total is calculated in realtime
 * 
 * Why Cart is Global State (Zustand):
 * 1. Cart needs to be accessed from multiple components (Header badge, ProductDetail, Cart, Checkout)
 * 2. Cart should persist across page refreshes (localStorage)
 * 3. Cart updates need to trigger UI updates everywhere (reactive)
 * 4. Cart is independent of server data (local-first)
 */
const CartPage = () => {
  const navigate = useNavigate();
  
  // Get cart state and actions from Zustand store
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  /**
   * Handle proceed to checkout
   * B2C Flow: Cart -> Checkout -> Payment
   */
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="py-16">
        <div className="container-custom">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-de-primary" />
            </div>
            <h1 className="heading-3 text-primary-custom mb-4">Giỏ hàng trống</h1>
            <p className="paragraph-1 text-secondary-custom mb-8">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng.
            </p>
            <Link to="/products" className="btn-primary">
              Tiếp tục mua sắm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="heading-2 text-primary-custom mb-8">Giỏ hàng</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex gap-6 bg-white rounded-2xl border border-divider p-6"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-surface-light rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image || 'https://placehold.co/100x100?text=No+Image'}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/100x100?text=No+Image';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="paragraph-1-medium text-primary-custom mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="subtitle-semibold text-de-primary">
                    {/* Ensure price is handled safely */}
                    {(Number(item.price) || 0).toLocaleString('vi-VN')}₫
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end justify-between">
                  {/* Quantity - Now using Zustand updateQuantity */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center border border-divider rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-surface-light transition-colors"
                      >
                        <Minus className="w-4 h-4 text-secondary-custom" />
                      </button>
                      <span className="w-10 text-center paragraph-2-medium text-primary-custom">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={`p-2 transition-colors ${
                          (item.maxStock || item.stock) && item.quantity >= (item.maxStock || item.stock)
                            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                            : 'hover:bg-surface-light'
                        }`}
                        disabled={(item.maxStock || item.stock) && item.quantity >= (item.maxStock || item.stock)}
                      >
                        <Plus className="w-4 h-4 text-secondary-custom" />
                      </button>
                    </div>
                    {(item.maxStock || item.stock) && item.quantity >= (item.maxStock || item.stock) && (
                      <span className="text-xs text-orange-500 font-medium whitespace-nowrap">
                        Max stock: {item.maxStock || item.stock}
                      </span>
                    )}
                  </div>

                  {/* Remove Button - Now using Zustand removeItem */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors paragraph-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-divider p-6 sticky top-28">
              <h3 className="subtitle-semibold text-primary-custom mb-6">Tóm tắt đơn hàng</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between paragraph-1 text-secondary-custom">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between paragraph-1 text-secondary-custom">
                  <span>Phí vận chuyển</span>
                  <span>{shipping.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="border-t border-divider pt-4">
                  <div className="flex justify-between subtitle-semibold text-primary-custom">
                    <span>Tổng cộng</span>
                    <span>{total.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full btn-primary py-4 mb-4"
              >
                Tiến hành thanh toán
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

              <Link 
                to="/products" 
                className="block text-center paragraph-2 text-de-primary hover:underline"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default CartPage;
