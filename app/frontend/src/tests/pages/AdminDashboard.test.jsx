import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import adminService from '@/api/adminService';

vi.mock('@/api/adminService', () => ({
  default: {
    getStats: vi.fn(),
  }
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null
}));

describe('AdminDashboard Component', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );

  it('renders loading state', () => {
    adminService.getStats.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    adminService.getStats.mockRejectedValue(new Error('Failed to fetch'));
    renderComponent();
    expect(await screen.findByText('Lỗi tải dữ liệu.')).toBeInTheDocument();
  });

  it('renders dashboard stats', async () => {
    adminService.getStats.mockResolvedValue({
      data: {
        data: {
          stats: {
            totalUsers: 100,
            totalOrders: 50,
            totalProducts: 200,
            totalRevenue: 5000000,
            chartData: []
          }
        }
      }
    });

    renderComponent();

    // Verify raw numbers rendered
    expect(await screen.findByText('100')).toBeInTheDocument(); // totalUsers
    expect(screen.getByText('50')).toBeInTheDocument(); // totalOrders
    expect(screen.getByText('200')).toBeInTheDocument(); // totalProducts
    
    // Revenue mapping matches partial due to `₫` encoding
    const revenueElements = screen.queryAllByText(/5\.000\.000/);
    expect(revenueElements.length).toBeGreaterThan(0);
  });

  it('handles tab switching', async () => {
    adminService.getStats.mockResolvedValue({
      data: {
        data: {
          stats: {
            totalUsers: 100,
            totalOrders: 50,
            totalProducts: 200,
            totalRevenue: 5000000,
            chartData: []
          }
        }
      }
    });

    renderComponent();
    await screen.findByText('Báo cáo tăng trưởng');

    // Default tab is revenue -> AreaChart
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();

    // Click orders tab
    fireEvent.click(screen.getByRole('button', { name: "Đơn hàng" }));
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Click customers tab
    fireEvent.click(screen.getByRole('button', { name: "Khách hàng" }));
    expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0); // Also uses BarChart
  });
});
