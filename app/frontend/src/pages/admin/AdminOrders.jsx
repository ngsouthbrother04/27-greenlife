import { useState } from 'react';
import { Search, Eye, Edit, Loader2, Trash2, X } from 'lucide-react';
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
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
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
      // Handle both { data: { order: ... } } and { order: ... } structures
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Order Details #{selectedOrder.id}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Shipping & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Info</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500 text-sm block">Name:</span>
                      <p className="font-medium">{selectedOrder.user?.fullName || 'Guest'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Email:</span>
                      <p className="font-medium">{selectedOrder.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Phone (Account):</span>
                      <p className="font-medium">{selectedOrder.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Details</h3>
                   <div className="space-y-2">
                     {(() => {
                        let shipping = {};
                        try {
                          shipping = JSON.parse(selectedOrder.shippingAddress || '{}');
                        } catch (e) {
                          shipping = { detail: selectedOrder.shippingAddress };
                        }
                        return (
                          <>
                            <div>
                              <span className="text-gray-500 text-sm block">Receiver:</span>
                              <p className="font-medium">{shipping.receiver || selectedOrder.user?.fullName || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm block">Phone:</span>
                              <p className="font-medium">{shipping.phone || selectedOrder.user?.phone || 'Not Provided'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm block">Address:</span>
                              <p className="font-medium">
                                {shipping.detail ? `${shipping.detail}, ${shipping.city || ''}` : (selectedOrder.shippingAddress || 'N/A')}
                              </p>
                            </div>
                          </>
                        );
                     })()}
                   </div>
                </div>
              </div>

              {/* Order Note */}
              {selectedOrder.note && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Note</h3>
                  <p className="text-gray-700 italic">"{selectedOrder.note}"</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                         {item.product?.images?.[0] && (
                           <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                         )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(item.price).toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium uppercase">{selectedOrder.payment?.method || 'COD'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                   <span className="text-gray-600">Payment Status:</span>
                   <span className={`font-medium ${selectedOrder.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                     {selectedOrder.payment?.status || 'PENDING'}
                   </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-de-primary mt-4 pt-4 border-t border-gray-100">
                  <span>Total Amount:</span>
                  <span>{Number(selectedOrder.total).toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
