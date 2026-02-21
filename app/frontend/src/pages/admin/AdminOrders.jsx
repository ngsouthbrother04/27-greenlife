import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Loader2, Trash2, X, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '@/api/orderService';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => orderService.getOrders({ status: statusFilter, limit: 100 }),
    placeholderData: (previousData) => previousData,
  });

  const orders = ordersData?.data?.orders || ordersData?.orders || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
      
      // Update selected order if it's currently open
      if (selectedOrder && selectedOrder.id === variables.id) {
        // We fetch the updated order fully to ensure payment status is synced if backend changes it
        // Or we can just update status locally, but fetching is safer to get payment status changes.
        handleViewOrder(variables.id);
      }
    },
    onError: () => toast.error('Failed to update status')
  });

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) || 
    order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteOrderMutation = useMutation({
    mutationFn: (id) => orderService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order deleted successfully');
    },
    onError: () => toast.error('Failed to delete order')
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(id);
    }
  };

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = async (id) => {
    try {
      const response = await orderService.getAdminOrder(id);
      const orderData = response.data?.order || response.order || response;
      if (orderData) {
        setSelectedOrder(orderData);
      } else {
         toast.error('Order data structure invalid');
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      toast.error('Failed to load order details');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedOrder) {
        setSelectedOrder(null);
      }
    };
    
    if (selectedOrder) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOrder]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-de-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-de-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý (PENDING)</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="SHIPPING">Đang giao (SHIPPING)</option>
            <option value="DELIVERED">Đã giao (DELIVERED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.user?.fullName || 'Guest'}</div>
                        <div className="text-sm text-gray-500">{order.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-de-primary">
                        {Number(order.total).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="SHIPPING">SHIPPING</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewOrder(order.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 transition-opacity" aria-hidden="true" onClick={() => setSelectedOrder(null)}></div>

            {/* Modal Panel */}
            <div className="relative inline-block w-full max-w-2xl bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 flex flex-col max-h-[90vh]">
              {/* Header (Fixed) */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900" id="modal-title">Order Details #{selectedOrder.id}</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body (Scrollable) */}
              <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Info</h3>
                  <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                    {(() => {
                      let shipping = {};
                      try {
                        shipping = JSON.parse(selectedOrder.shippingAddress || '{}');
                      } catch (e) {
                        shipping = { address: selectedOrder.shippingAddress };
                      }
                      
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                          <div>
                            <span className="text-gray-500 text-xs font-medium block mb-1">Name</span>
                            <p className="font-medium text-gray-900">{shipping.fullName || shipping.receiver || selectedOrder.user?.fullName || 'Guest'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs font-medium block mb-1">Phone</span>
                            <p className="font-medium text-gray-900">{shipping.phone || selectedOrder.user?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs font-medium block mb-1">Email</span>
                            <p className="font-medium text-gray-900 truncate">{shipping.email || selectedOrder.user?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs font-medium block mb-1">Address</span>
                            <p className="font-medium text-gray-900 line-clamp-2" title={shipping.address || shipping.detail ? `${shipping.detail || shipping.address || ''}${shipping.city ? `, ${shipping.city}` : ''}` : (selectedOrder.shippingAddress || 'N/A')}>
                              {shipping.address || shipping.detail ? `${shipping.detail || shipping.address || ''}${shipping.city ? `, ${shipping.city}` : ''}` : (selectedOrder.shippingAddress || 'N/A')}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Order Note */}
                {selectedOrder.note && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Note</h3>
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                      <p className="text-amber-800 italic text-sm">"{selectedOrder.note}"</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="space-y-3 bg-white border border-gray-100 rounded-xl p-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200/50">
                           {item.product?.images?.[0] ? (
                             <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">
                               <Package className="w-6 h-6" />
                             </div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.product?.name}</p>
                          <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">{Number(item.price).toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & Total */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Payment Method</span>
                    <span className="font-bold border border-gray-200 bg-white px-3 py-1 rounded-md text-sm uppercase shadow-sm">
                      {selectedOrder.payment?.method || 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                     <span className="text-gray-600 font-medium">Payment Status</span>
                     {(() => {
                        // 1. Determine if it is a COD order
                        const isCOD = !selectedOrder.payment || selectedOrder.payment.method === 'COD';
                        
                        // 2. Base payment status flags
                        const isSuccess = selectedOrder.payment?.status === 'SUCCESS' || ['PAID', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status);
                        
                        // If it's COD and it's SHIPPING, it is NEITHER success nor failed, but "SHIPPING (COD)"
                        // If it's COD and it's CANCELLED, it is FAILED
                        const isFailed = (selectedOrder.payment?.status === 'FAILED' && !isCOD) || selectedOrder.status === 'CANCELLED';
                        
                        // 3. Specific override for COD orders in SHIPPING state
                        if (isCOD && selectedOrder.status === 'SHIPPING') {
                          return (
                            <span className="font-bold border px-3 py-1 rounded-md text-sm shadow-sm text-blue-700 bg-blue-50 border-blue-200">
                              SHIPPING (COD)
                            </span>
                          );
                        }

                        // 4. Default text & colors
                        let statusText = isSuccess ? 'SUCCESS' : isFailed ? 'FAILED' : 'PENDING';
                        let statusColor = isSuccess 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : isFailed 
                            ? 'text-red-700 bg-red-50 border-red-200' 
                            : 'text-amber-700 bg-amber-50 border-amber-200';
                        
                        return (
                          <span className={`font-bold border px-3 py-1 rounded-md text-sm shadow-sm ${statusColor}`}>
                            {statusText}
                          </span>
                        );
                     })()}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-black text-de-primary">
                      {Number(selectedOrder.total).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Footer (Fixed) */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
