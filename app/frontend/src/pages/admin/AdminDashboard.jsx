import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

/**
 * AdminDashboard Component
 * 
 * Main dashboard for admin panel showing:
 * - Quick stats overview
 * - Recent orders
 * - Quick actions
 */
const AdminDashboard = () => {
  // Mock stats data - will be replaced with real API data
  const stats = [
    { name: 'Tổng sản phẩm', value: '24', icon: Package, color: 'bg-blue-500' },
    { name: 'Đơn hàng hôm nay', value: '12', icon: ShoppingCart, color: 'bg-green-500' },
    { name: 'Khách hàng', value: '156', icon: Users, color: 'bg-purple-500' },
    { name: 'Doanh thu tháng', value: '15.2M ₫', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Chưa có đơn hàng nào
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
