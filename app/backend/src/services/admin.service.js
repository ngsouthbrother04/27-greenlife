import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Get Dashboard Stats
 * Supports grouping logic for trailing 30 days, quarter (90 days), or year (12 months)
 */
export const getDashboardStats = async (range = '30d') => {
  let startDate = new Date();

  // Configure time ranges
  if (range === 'year') {
    startDate.setMonth(startDate.getMonth() - 11); // Last 12 months including current
    startDate.setDate(1); // Start from beginning of the month
  } else if (range === 'quarter') {
    // We want 4 quarters trailing. 
    // Start from 12 months ago to gather 4 full quarters
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
  } else {
    // Default to 30d
    startDate.setDate(startDate.getDate() - 29); // Last 30 days
  }

  // Reset time to start of day for exact boundaries
  startDate.setHours(0, 0, 0, 0);

  const [totalUsers, totalOrders, totalProducts, revenueAgg, recentOrders, recentUsers] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: startDate }, role: 'CUSTOMER' } }),
    prisma.order.count({ where: { createdAt: { gte: startDate } } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startDate },
        OR: [
          { status: 'COMPLETED' },
          { status: 'PAID', payment: { method: 'MOMO' } }
        ]
      }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, total: true, status: true, payment: { select: { method: true } } }
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: startDate }, role: 'CUSTOMER' },
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

  // Setup chart data structure based on range
  const chartDataMap = new Map();

  if (range === 'year') {
    // 12 Months: Format "MM/YYYY"
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      const dateString = `${m}/${y}`;
      chartDataMap.set(dateString, { date: dateString, revenue: 0, orders: 0, customers: 0 });
    }
  } else if (range === 'quarter') {
    // 4 Quarters trailing: Format "Q1/20xx"
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - (i * 3));
      const q = Math.floor(date.getMonth() / 3) + 1;
      const y = date.getFullYear();
      const dateString = `Q${q}/${y}`;
      chartDataMap.set(dateString, { date: dateString, revenue: 0, orders: 0, customers: 0 });
    }
  } else {
    // 30 Days (Default): Format "DD/MM"
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const dateString = `${d}/${m}`;
      chartDataMap.set(dateString, { date: dateString, revenue: 0, orders: 0, customers: 0 });
    }
  }

  // Helper to format map keys correctly 
  const getFormatDate = (dateOb) => {
    if (range === 'year') {
      const m = (dateOb.getMonth() + 1).toString().padStart(2, '0');
      const y = dateOb.getFullYear();
      return `${m}/${y}`;
    } else if (range === 'quarter') {
      const q = Math.floor(dateOb.getMonth() / 3) + 1;
      const y = dateOb.getFullYear();
      return `Q${q}/${y}`;
    } else {
      const d = dateOb.getDate().toString().padStart(2, '0');
      const m = (dateOb.getMonth() + 1).toString().padStart(2, '0');
      return `${d}/${m}`;
    }
  };

  recentOrders.forEach(order => {
    const dateString = getFormatDate(order.createdAt);
    if (chartDataMap.has(dateString)) {
      const existing = chartDataMap.get(dateString);
      existing.orders += 1;

      const isCompleted = order.status === 'COMPLETED';
      const isMomoPaid = order.status === 'PAID' && order.payment?.method === 'MOMO';

      if (isCompleted || isMomoPaid) {
        existing.revenue += Number(order.total || 0);
      }
    }
  });

  recentUsers.forEach(user => {
    const dateString = getFormatDate(user.createdAt);
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
