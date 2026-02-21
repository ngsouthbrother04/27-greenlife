import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Get Dashboard Stats
 * Includes grouping logic for trailing 30 days of data for charts
 */
export const getDashboardStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, totalOrders, totalProducts, revenueAgg, recentOrders, recentUsers] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'COMPLETED', 'DELIVERED'] } }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, status: true }
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, role: 'CUSTOMER' },
      select: { createdAt: true }
    })
  ]);

  // Top selling products (simplified by order items count)
  // Prisma doesn't support complex groupBy + join easily for top products in one query properly without raw query or separate logic.
  // We will do a basic grouped query on OrderItem.
  const topSelling = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  // Fetch product details for top selling
  const topProducts = await Promise.all(
    topSelling.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, images: true }
      });
      return {
        ...product,
        sold: item._sum.quantity
      };
    })
  );

  // Generate array for last 30 days to ensure continuous charts (even on days with no data)
  const chartDataMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    chartDataMap.set(dateString, { date: dateString, revenue: 0, orders: 0, customers: 0 });
  }

  // Populate chart map with real data
  recentOrders.forEach(order => {
    const dateString = order.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (chartDataMap.has(dateString)) {
      const existing = chartDataMap.get(dateString);
      existing.orders += 1;
      if (['PAID', 'COMPLETED', 'DELIVERED'].includes(order.status)) {
        existing.revenue += Number(order.total || 0);
      }
    }
  });

  recentUsers.forEach(user => {
    const dateString = user.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (chartDataMap.has(dateString)) {
      const existing = chartDataMap.get(dateString);
      existing.customers += 1;
    }
  });

  const chartData = Array.from(chartDataMap.values());

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: revenueAgg._sum.total || 0,
    topProducts,
    chartData
  };
};

/**
 * Get All Orders (Admin)
 */
export const getAllOrders = async (query) => {
  const { page = 1, limit = 10, status, fromDate, toDate } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};

  if (status) where.status = status;

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        payment: true
      }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

/**
 * Update Order Status
 */
export const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { payment: true }
  });

  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');

  return await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: Number(orderId) },
      data: { status }
    });

    // Sync Payment status if Order status becomes PAID or COMPLETED
    if ((status === 'PAID' || status === 'COMPLETED') && order.payment && order.payment.status !== 'SUCCESS') {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: 'SUCCESS', paidAt: new Date() }
      });
    }

    // Sync Payment status if Order status becomes CANCELLED
    if (status === 'CANCELLED' && order.payment && order.payment.status !== 'FAILED') {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: 'FAILED' }
      });
    }

    return updatedOrder;
  });
};

/**
 * Get Single Order (Admin)
 */
export const getOrder = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true
              // sku: true // removed because Product model doesn't have sku
            }
          }
        }
      },
      payment: true
    }
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  return order;
};

/**
 * Delete Order
 */
export const deleteOrder = async (id) => {
  const order = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  // Use a transaction to ensure all related data is deleted 
  // because schema.prisma does not have onDelete: Cascade set up
  await prisma.$transaction(async (tx) => {
    // 1. Delete associated OrderItems
    await tx.orderItem.deleteMany({
      where: { orderId: Number(id) }
    });

    // 2. Delete associated Payment (if exists)
    await tx.payment.deleteMany({
      where: { orderId: Number(id) }
    });

    // 3. Delete the Order itself
    await tx.order.delete({
      where: { id: Number(id) }
    });
  });

  return { message: 'Order deleted successfully' };
};
