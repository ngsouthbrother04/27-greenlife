import { useState } from 'react';
import { Search, UserCheck, UserX, Loader2, Edit, Trash2, X, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '@/api/authService';
import toast from 'react-hot-toast';

/**
 * AdminUsers Component
 * 
 * User management page for admin:
 * - List all users/customers
 * - Edit user role
 * - Delete user
 */
const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authService.getAllUsers(),
  });

  const users = usersData?.data?.users || [];

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => authService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Cập nhật người dùng thành công');
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật người dùng');
    }
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => authService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Xóa người dùng thành công');
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  });

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    // Construct payload - currently only role is editable per backend
    const payload = {
      role: editingUser.role
    };

    updateMutation.mutate({ id: editingUser.id, data: payload });
  };

  const handleDeleteUser = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
      
      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-de-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Users Table */}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Người dùng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số điện thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-de-primary/10 flex items-center justify-center text-de-primary font-bold">
                              {user.fullName?.charAt(0).toUpperCase()}
                           </div>
                           {user.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa người dùng</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input 
                  type="text" 
                  value={editingUser.fullName}
                  disabled
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="text" 
                  value={editingUser.email}
                  disabled
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-de-primary focus:outline-none"
                >
                  <option value="CUSTOMER">Customer (Khách hàng)</option>
                  <option value="ADMIN">Admin (Quản trị viên)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-de-primary text-white rounded-lg font-medium hover:bg-de-primary/90 flex items-center gap-2"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl animate-scale-in text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-gray-500 mb-6">
              Hành động này không thể hoàn tác. Người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
              >
                 {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
