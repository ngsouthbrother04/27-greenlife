import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';

// Import product images
import toothpasteImg from '@/assets/images/natural_toothpaste_1770003224265.png';
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

const initialCartItems = [
  {
    id: 1,
    name: 'Natural Teeth Whitening Toothpaste - Tea tree & Charcoal',
    price: 100,
    quantity: 2,
    image: toothpasteImg,
  },
  {
    id: 2,
    name: 'Organic Bamboo Toothbrush with Soft Natural Bristles',
    price: 45,
    quantity: 1,
    image: toothbrushImg,
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id, delta) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="py-16">
        <div className="container-custom">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-de-primary" />
            </div>
            <h1 className="heading-3 text-primary-custom mb-4">Your cart is empty</h1>
            <p className="paragraph-1 text-secondary-custom mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
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
        <h1 className="heading-2 text-primary-custom mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.id}
                className="flex gap-6 bg-white rounded-2xl border border-divider p-6"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-surface-light rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="paragraph-1-medium text-primary-custom mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="subtitle-semibold text-de-primary">
                    ${item.price}
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end justify-between">
                  {/* Quantity */}
                  <div className="flex items-center border border-divider rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-surface-light transition-colors"
                    >
                      <Minus className="w-4 h-4 text-secondary-custom" />
                    </button>
                    <span className="w-10 text-center paragraph-2-medium text-primary-custom">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-surface-light transition-colors"
                    >
                      <Plus className="w-4 h-4 text-secondary-custom" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors paragraph-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-divider p-6 sticky top-28">
              <h3 className="subtitle-semibold text-primary-custom mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between paragraph-1 text-secondary-custom">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between paragraph-1 text-secondary-custom">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-divider pt-4">
                  <div className="flex justify-between subtitle-semibold text-primary-custom">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full btn-primary py-4 mb-4">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

              <Link 
                to="/products" 
                className="block text-center paragraph-2 text-de-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default CartPage;
