import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, RefreshCcw } from 'lucide-react';
import { useCartStore } from '@/stores';

const MoMoResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [countdown, setCountdown] = useState(5);
  const { clearCart } = useCartStore();

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const msg = searchParams.get('message');
    const fullOrderId = searchParams.get('orderId');
    
    // Extract actual internal order ID if formatted like "156-1772715119949"
    if (fullOrderId) {
      setOrderId(fullOrderId.split('-')[0]);
    }

    if (resultCode === '0') {
      setStatus('success');
      setMessage(msg || 'Thanh toán thành công! Cảm ơn bạn đã mua sắm.');
      clearCart();
    } else if (resultCode) {
      setStatus('error');
      setMessage(msg || 'Thanh toán thất bại hoặc đã bị hủy. Đơn hàng của bạn không được tạo thành công.');
    } else {
      setStatus('invalid');
      setMessage('Không tìm thấy thông tin giao dịch hợp lệ.');
    }
  }, [searchParams, clearCart]);

  // Handle Countdown Redirect
  useEffect(() => {
    if (status === 'loading') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (status === 'success') {
            navigate(orderId ? `/profile/orders/${orderId}` : '/profile?tab=orders');
          } else {
            navigate('/checkout');
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, orderId, navigate]);

  if (status === 'loading') {
    return (
      <div className="py-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-de-primary"></div>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="py-16 bg-gray-50 min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-divider max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>
        
        <div className="mb-8 space-y-2 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p>{message}</p>
          {orderId && (
            <p className="font-medium text-gray-800">
              Mã đơn hàng: #{orderId}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-6 font-medium">
          Đang tự động chuyển hướng sau {countdown} giây...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSuccess ? (
            <Link 
              to={orderId ? `/profile/orders/${orderId}` : '/profile?tab=orders'} 
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Xem đơn hàng
            </Link>
          ) : (
            <Link 
              to="/checkout" 
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Thử lại thanh toán
            </Link>
          )}
          
          <Link 
            to="/" 
            className="px-6 py-3 bg-de-primary text-white font-medium rounded-xl hover:bg-de-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Về trang chủ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MoMoResultPage;
