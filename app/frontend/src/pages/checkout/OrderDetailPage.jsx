import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CreditCard, ExternalLink, Package, ShieldCheck, FileText, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import orderService from '@/api/orderService';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();

  // Fetch Order Details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orderDetail', id],
    queryFn: () => orderService.getOrderById(id),
    retry: 1
  });

  const order = data?.data?.order;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-de-primary"></div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="py-20 text-center min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-500">{error?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng.'}</p>
        <Link to="/profile" className="btn-primary mt-4">Quay lại danh sách</Link>
      </div>
    );
  }

  // Helpers
  const formatMoney = (amount) => Number(amount).toLocaleString('vi-VN') + '₫';
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPING': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'PAID': return 'Chờ giao hàng'; // Conceptually, it's paid but waiting to be shipped
      case 'SHIPPING': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusBadge = (payment) => {
    if (!payment) return null;
    if (payment.status === 'SUCCESS') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Đã thanh toán</span>;
    }
    if (payment.status === 'FAILED') {
       return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Thất bại</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Chờ thu tiền</span>;
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container-custom max-w-4xl">
        
        {/* Header link */}
        <Link 
          to="/profile?tab=orders" 
          className="flex items-center gap-2 text-gray-500 hover:text-de-primary mb-6 transition-colors w-fit font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách đơn hàng
        </Link>
        
        {/* Title & Status Bar */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Chi tiết đơn hàng #{order.id}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 
              Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {order.status === 'COMPLETED' && <ShieldCheck className="w-4 h-4" />}
              {order.status === 'CANCELLED' && <XCircle className="w-4 h-4" />}
              {(order.status === 'SHIPPING' || order.status === 'PAID') && <Package className="w-4 h-4" />}
              {order.status === 'PENDING' && <Clock className="w-4 h-4" />}
              {getStatusText(order.status)}
            </div>
            {getPaymentStatusBadge(order.payment)}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-de-primary" />
                  Sản phẩm đã mua
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center p-2">
                         {item.product?.images?.[0] ? (
                           <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                         ) : (
                           <div className="text-gray-300"><Package className="w-8 h-8" /></div>
                         )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product?.slug || item.productId}`} className="font-medium text-gray-900 hover:text-de-primary truncate block transition-colors">
                          {item.product?.name || `Product #${item.productId}`}
                        </Link>
                        <div className="mt-1 flex gap-4 text-sm text-gray-500">
                          <span>Số lượng: <strong className="text-gray-700">{item.quantity}</strong></span>
                          <span>Giá: <strong className="text-gray-700">{formatMoney(item.price)}</strong></span>
                        </div>
                      </div>
                      
                      {/* Line Total */}
                      <div className="text-right shrink-0">
                         <span className="font-semibold text-gray-900">{formatMoney(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Timeline or Notes (Optional) */}
            {order.note && (
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Ghi chú đơn hàng
                </h3>
                <p className="text-blue-800 text-sm whitespace-pre-wrap">{order.note}</p>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Thanh toán</h2>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex justify-between text-gray-600 text-sm">
                   <span>Tạm tính</span>
                   <span>{formatMoney(order.total)}</span>
                 </div>
                 <div className="flex justify-between text-gray-600 text-sm border-b border-dashed border-gray-200 pb-4">
                   <span>Phí vận chuyển</span>
                   <span>0₫</span>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                   <span className="font-semibold text-gray-900">Tổng cộng</span>
                   <span className="text-xl font-bold text-de-primary">{formatMoney(order.total)}</span>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 flex items-center justify-between">
                      <span className="flex items-center gap-2"><CreditCard className="w-4 h-4"/> Phương thức</span>
                      <strong className="text-gray-900">{order.payment?.method === 'MOMO' ? 'MoMo' : 'COD'}</strong>
                    </p>
                    <p className="text-sm text-gray-500 flex items-center justify-between mt-2">
                      <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Trạng thái TT</span>
                      <strong className={order.payment?.status === 'SUCCESS' ? 'text-green-600' : (order.payment?.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600')}>
                        {order.payment?.status === 'SUCCESS' ? 'Đã thu tiền' : (order.payment?.status === 'FAILED' ? 'Thất bại' : 'Chờ thu tiền')}
                      </strong>
                    </p>
                 </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Thông tin giao hàng
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || order.user?.fullName || 'Khách hàng'}</p>
                    <p className="mt-1">{order.shippingAddress?.phone || order.user?.phone}</p>
                    <p className="mt-1">{order.shippingAddress?.detail || order.shippingAddress?.address || 'Không có địa chỉ chi tiết'}</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
