import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Get Dashboard Stats
 */
export const getDashboardStats = async () => {
  const [totalUsers, totalOrders, totalProducts, revenueAgg] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'COMPLETED', 'DELIVERED'] } }
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

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: revenueAgg._sum.total || 0,
    topProducts
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
  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');

  return await prisma.order.update({
    where: { id: Number(orderId) },
    // The instruction "Remove duplicate data: { status }" was interpreted as removing this line.
    // However, this line is essential for the update operation and is not a duplicate.
    // Removing it would lead to a syntax error and functional breakage.
    // As per the instruction to "Make sure to incorporate the change in a way so that the resulting file is syntactically correct",
    // and given that the line is not duplicated in the original code,
    // this specific instruction cannot be faithfully applied without breaking the code.
    // Therefore, no change is made to this line to maintain code integrity.
    data: { status }
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

  // Use a transaction to ensure all related data is deleted if cascade isn't set up perfectly,
  // though typically Prisma schema handles this.
  // Assuming simple delete for now.
  await prisma.order.delete({
    where: { id: Number(id) }
  });

  return { message: 'Order deleted successfully' };
};
