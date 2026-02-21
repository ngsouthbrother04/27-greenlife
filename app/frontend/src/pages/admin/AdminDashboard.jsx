import { useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import adminService from '@/api/adminService';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

/**
 * AdminDashboard Component
 * 
 * Main dashboard for admin panel showing:
 * - Quick stats overview
 * - Recent orders
 * - Quick actions
 */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('revenue');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats,
  });

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="flex h-96 items-center justify-center text-red-500">Lỗi tải dữ liệu.</div>;
  }

  const stats = data?.data?.stats || {};
  const { totalUsers = 0, totalOrders = 0, totalProducts = 0, totalRevenue = 0, chartData = [] } = stats;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const statCards = [
    { name: 'Tổng sản phẩm', value: totalProducts, icon: Package, color: 'bg-blue-500' },
    { name: 'Tổng đơn hàng', value: totalOrders, icon: ShoppingCart, color: 'bg-green-500' },
    { name: 'Khách hàng', value: totalUsers, icon: Users, color: 'bg-purple-500' },
    { name: 'Tổng doanh thu', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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
      
      {/* Charts Section */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 p-4 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Thống kê 30 ngày qua</h2>
          
          <div className="mt-4 sm:ml-4 sm:mt-0">
            <nav className="-mb-px flex space-x-4 bg-gray-50/50 p-1 rounded-lg border border-gray-200" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`
                  whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all
                  ${activeTab === 'revenue'
                    ? 'bg-white text-[#f97316] shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                Doanh thu
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`
                  whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all
                  ${activeTab === 'orders'
                    ? 'bg-white text-[#22c55e] shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                Đơn hàng
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`
                  whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all
                  ${activeTab === 'customers'
                    ? 'bg-white text-[#a855f7] shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                Khách hàng
              </button>
            </nav>
          </div>
        </div>
        
        <div className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'revenue' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              ) : activeTab === 'orders' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis stroke="#22c55e" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" name="Đơn hàng" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis stroke="#a855f7" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="customers" name="Khách hàng mới" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
