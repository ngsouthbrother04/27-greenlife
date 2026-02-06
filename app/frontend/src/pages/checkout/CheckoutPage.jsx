import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@/stores';
import orderService from '@/api/orderService';
import { Loader2, ArrowLeft, ShieldCheck, Truck, CreditCard, Banknote } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Validation Schema
const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (min 2 chars)'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required (min 5 chars)'),
  paymentMethod: z.enum(['cod', 'banking', 'momo'], {
    required_error: 'Please select a payment method',
  }),
  note: z.string().optional(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cod',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        ...data,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalPrice(),
      };

      const response = await orderService.createOrder(orderData);
      
      console.log('Order created:', response);
      
      clearCart();

      // Handle Mock Payment Redirect
      if (response.paymentUrl) {
        // Mock redirect for demo purposes
        window.location.href = response.paymentUrl;
      } else {
        toast.success('Đặt hàng thành công! (COD)');
        navigate('/');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null; // or loading spinner while redirecting
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container-custom">
        <Link to="/cart" className="flex items-center gap-2 text-secondary-custom hover:text-de-primary mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        
        <h1 className="heading-2 text-primary-custom mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Shipping Info */}
              <div className="bg-white p-6 rounded-2xl border border-divider">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-de-primary/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-de-primary" />
                  </div>
                  <h2 className="heading-3 text-primary-custom">Shipping Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      {...register('fullName')}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-de-primary/20 outline-none transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-de-primary'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      {...register('phone')}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-de-primary/20 outline-none transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-de-primary'
                      }`}
                      placeholder="0123456789"
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-de-primary/20 outline-none transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-200 focus:border-de-primary'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Shipping Address</label>
                    <textarea
                      {...register('address')}
                      rows="3"
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-de-primary/20 outline-none transition-all ${
                        errors.address ? 'border-red-500' : 'border-gray-200 focus:border-de-primary'
                      }`}
                      placeholder="123 Green Street, District 1, HCMC"
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                  </div>
                  
                  {/* Note */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Order Note (Optional)</label>
                    <textarea
                      {...register('note')}
                      rows="2"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-de-primary focus:ring-2 focus:ring-de-primary/20 outline-none transition-all"
                      placeholder="Gate code, delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-2xl border border-divider">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-de-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-de-primary" />
                  </div>
                  <h2 className="heading-3 text-primary-custom">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* COD */}
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                     'hover:border-de-primary/50'
                  }`}>
                    <input 
                      type="radio" 
                      value="cod" 
                      {...register('paymentMethod')} 
                      className="w-5 h-5 text-de-primary focus:ring-de-primary"
                    />
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Banknote className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">Cash on Delivery (COD)</span>
                      <span className="text-sm text-gray-500">Pay when you receive your order</span>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                     'hover:border-de-primary/50'
                  }`}>
                    <input 
                      type="radio" 
                      value="momo" 
                      {...register('paymentMethod')} 
                      className="w-5 h-5 text-de-primary focus:ring-de-primary"
                    />
                    <div className="p-2 bg-pink-100 rounded-lg">
                      {/* You can use an SVG icon for MoMo here if you have one, or a placeholder */}
                      <CreditCard className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">MoMo Wallet</span>
                      <span className="text-sm text-gray-500">Fast and secure payment via MoMo App</span>
                    </div>
                  </label>
                  
                  {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>}
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-divider sticky top-28">
              <h3 className="heading-3 text-primary-custom mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-surface-light rounded-lg overflow-hidden shrink-0 border border-divider">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-medium text-de-primary">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-divider">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                  <span>Total</span>
                  <span className="text-de-primary">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Your personal data will be used to process your order and for other purposes described in our privacy policy.</p>
                </div>
                
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
