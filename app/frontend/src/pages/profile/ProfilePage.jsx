import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores';
import authService from '@/api/authService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '@/api/orderService';
import { Loader2, Save, User, Package, ChevronRight, CheckCircle2, XCircle, Clock, Truck, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Schema Validation
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(), // Read-only but good to validate structure
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().or(z.literal('')),
});

const addressSchema = z.object({
  receiver: z.string().min(2, 'Receiver name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  detail: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required (min 2 chars)'),
  isDefault: z.boolean().optional()
});

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingAddressId, setEditingAddressId] = useState(null);
  const queryClient = useQueryClient();
  
  // Read tab from URL or default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };
  
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      receiver: user?.fullName || user?.name || '',
      phone: user?.phone || '',
      detail: '',
      city: '',
      isDefault: false,
    },
  });

  // Mutation for update profile
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data, variables) => {
      // Update local store
      updateUser({
        fullName: variables.fullName,
        name: variables.fullName,
        phone: variables.phone
      });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to update profile.');
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['myAddresses'],
    queryFn: authService.getAddresses,
    enabled: activeTab === 'addresses',
  });

  const addresses = addressesData?.data?.addresses || [];

  const addAddressMutation = useMutation({
    mutationFn: authService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
      resetAddressForm({
        receiver: user?.fullName || user?.name || '',
        phone: user?.phone || '',
        detail: '',
        city: '',
        isDefault: false,
      });
      toast.success('Address added successfully!');
    },
    onError: () => toast.error('Failed to add address.'),
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }) => authService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
      setEditingAddressId(null);
      resetAddressForm({
        receiver: user?.fullName || user?.name || '',
        phone: user?.phone || '',
        detail: '',
        city: '',
        isDefault: false,
      });
      toast.success('Address updated successfully!');
    },
    onError: () => toast.error('Failed to update address.'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: authService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
      toast.success('Address deleted successfully!');
    },
    onError: () => toast.error('Failed to delete address.'),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: authService.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
      toast.success('Default address updated!');
    },
    onError: () => toast.error('Failed to update default address.'),
  });

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    resetAddressForm({
      receiver: address.receiver,
      phone: address.phone,
      detail: address.detail,
      city: address.city,
      isDefault: address.isDefault,
    });
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    resetAddressForm({
      receiver: user?.fullName || user?.name || '',
      phone: user?.phone || '',
      detail: '',
      city: '',
      isDefault: false,
    });
  };

  const onSubmitAddress = (data) => {
    if (editingAddressId) {
      updateAddressMutation.mutate({ id: editingAddressId, data });
      return;
    }

    addAddressMutation.mutate(data);
  };

  // Fetch Orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => orderService.getMyOrders({ limit: 50 }),
    enabled: activeTab === 'orders',
  });

  const orders = ordersData?.orders || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> Chờ xác nhận</span>;
      case 'PAID': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><Package className="w-3 h-3"/> Chờ giao hàng</span>;
      case 'SHIPPING': return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1"><Truck className="w-3 h-3"/> Đang giao</span>;
      case 'DELIVERED': return <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Đã giao</span>;
      case 'COMPLETED': return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Hoàn thành</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3"/> Đã hủy</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Helper component for tabs
  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${
        activeTab === id 
          ? 'border-de-primary text-de-primary bg-de-primary/5' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="container-custom py-12 px-4 lg:px-[130px]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          Tài khoản của tôi
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <TabButton id="profile" icon={User} label="Hồ sơ cá nhân" />
            <TabButton id="addresses" icon={MapPin} label="Địa chỉ giao hàng" />
            <TabButton id="orders" icon={Package} label="Lịch sử đơn hàng" />
          </div>
        </div>

        {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmitProfile(onSubmit)} className="space-y-6">
            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...registerProfile('email')}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                {...registerProfile('fullName')}
                className={`w-full px-4 py-3 rounded-lg bg-white border outline-none transition-all ${
                  profileErrors.fullName 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                }`}
                placeholder="Enter your full name"
              />
              {profileErrors.fullName && <p className="mt-1 text-sm text-red-500">{profileErrors.fullName.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                {...registerProfile('phone')}
                className={`w-full px-4 py-3 rounded-lg bg-white border outline-none transition-all ${
                  profileErrors.phone 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                }`}
                placeholder="0123456789"
              />
              {profileErrors.phone && <p className="mt-1 text-sm text-red-500">{profileErrors.phone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full sm:w-auto px-8 bg-[#405741] text-white font-semibold py-3 rounded-lg hover:bg-[#2d3e2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Lưu địa chỉ để chọn nhanh khi thanh toán.</p>
                </div>
                {editingAddressId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Huỷ chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Người nhận</label>
                  <input
                    type="text"
                    {...registerAddress('receiver')}
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                      addressErrors.receiver
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                    }`}
                    placeholder="Nguyen Van A"
                  />
                  {addressErrors.receiver && (
                    <p className="text-sm text-red-500">{addressErrors.receiver.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="tel"
                    {...registerAddress('phone')}
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                      addressErrors.phone
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                    }`}
                    placeholder="0123456789"
                  />
                  {addressErrors.phone && (
                    <p className="text-sm text-red-500">{addressErrors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Thành phố</label>
                  <input
                    type="text"
                    {...registerAddress('city')}
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                      addressErrors.city
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                    }`}
                    placeholder="Ho Chi Minh"
                  />
                  {addressErrors.city && (
                    <p className="text-sm text-red-500">{addressErrors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Địa chỉ chi tiết</label>
                  <textarea
                    rows="3"
                    {...registerAddress('detail')}
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                      addressErrors.detail
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                    }`}
                    placeholder="123 Green Street, District 1"
                  />
                  {addressErrors.detail && (
                    <p className="text-sm text-red-500">{addressErrors.detail.message}</p>
                  )}
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                  <input
                    type="checkbox"
                    {...registerAddress('isDefault')}
                    className="w-4 h-4 text-[#405741] focus:ring-[#405741]"
                  />
                  Đặt làm địa chỉ mặc định
                </label>

                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                    className="px-6 py-3 bg-[#405741] text-white font-semibold rounded-lg hover:bg-[#2d3e2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(addAddressMutation.isPending || updateAddressMutation.isPending) ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Địa chỉ đã lưu</h2>

              {isLoadingAddresses ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-7 h-7 animate-spin text-de-primary" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Bạn chưa có địa chỉ giao hàng nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-100 rounded-2xl p-5 hover:border-de-primary/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{address.receiver}</p>
                            {address.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Mặc định</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">{address.detail}{address.city ? `, ${address.city}` : ''}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultAddressMutation.mutate(address.id)}
                              className="px-3 py-2 text-xs font-medium text-[#405741] border border-[#405741]/20 rounded-lg hover:bg-[#405741]/10 transition-colors"
                            >
                              Đặt mặc định
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-gray-500 hover:text-[#405741] hover:bg-[#405741]/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Bạn có chắc muốn xoá địa chỉ này?')) {
                                deleteAddressMutation.mutate(address.id);
                              }
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h2>
            
            {isLoadingOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-500 mb-6">Bạn chưa thực hiện giao dịch nào trên hệ thống.</p>
                <Link to="/products" className="btn-primary inline-flex">
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-de-primary/30 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                      <div>
                        <span className="font-bold text-gray-900 text-lg block mb-1">
                          Đơn hàng #{order.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-de-primary">
                          {Number(order.total).toLocaleString('vi-VN')}₫
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                       <div className="flex -space-x-2">
                         {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 overflow-hidden flex items-center justify-center relative group">
                               {item.product?.images?.[0] ? (
                                 <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <span className="text-xs text-gray-400">?</span>
                               )}
                            </div>
                         ))}
                         {(order.items?.length || 0) > 3 && (
                           <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                             +{(order.items?.length || 0) - 3}
                           </div>
                         )}
                       </div>
                       
                       <Link 
                         to={`/profile/orders/${order.id}`}
                         className="text-sm font-medium text-de-primary hover:text-de-primary/80 flex items-center gap-1 transition-colors group"
                       >
                         Xem chi tiết
                         <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
