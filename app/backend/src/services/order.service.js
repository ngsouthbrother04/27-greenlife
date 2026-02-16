import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Create order from cart OR directly from items (Frontend Cart)
 */
export const createOrder = async (userId, shippingAddress, note, items = null, totalAmount = null) => {
  let orderItems = [];
  let finalTotal = 0;

  if (items && items.length > 0) {
    // Case 1: Create from passed items (Frontend Cart)
    orderItems = items;
    // Recalculate total for security (trust backend price, but for now assume items have price)
    // Ideally we should fetch latest price from DB for each item
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new ApiError(StatusCodes.BAD_REQUEST, `Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Product ${product.name} is out of stock`);
      }
      finalTotal += Number(product.price) * item.quantity;
      // Attach DB price to item to ensure accuracy
      item.price = product.price;
    }
  } else {
    // Case 2: Create from Backend Cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Product ${item.product.name} is out of stock or not enough quantity`
        );
      }
      finalTotal += Number(item.product.price) * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      });
    }
  }

  // 3. Create Order and OrderItems in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create Order
    const newOrder = await tx.order.create({
      data: {
        userId,
        total: finalTotal,
        status: 'PENDING',
        shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : (shippingAddress || 'Default Address'),
        note
      }
    });

    // Create OrderItems
    for (const item of orderItems) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }
      });
    }

    // Clear Backend Cart if it exists
    const cart = await tx.cart.findUnique({ where: { userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return newOrder;
  });

  return getOrderById(userId, order.id);
};

/**
 * Get user orders
 */
export const getUserOrders = async (userId, query) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (page - 1) * limit;

  const where = { userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true, slug: true }
            }
          }
        },
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
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single order by ID
 */
export const getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: true, slug: true }
          }
        }
      },
      payment: true,
      user: {
        select: { fullName: true, email: true, phone: true }
      }
    }
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  // Ownership check
  if (order.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to view this order');
  }

  return order;
};

/**
 * Cancel order
 */
export const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) }
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to cancel this order');
  }

  if (order.status !== 'PENDING') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Only PENDING orders can be cancelled');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(orderId) },
    data: { status: 'CANCELLED' } // Should also handle payment refund logic if needed, but prompted says "Wait for payment success"
  });

  return updatedOrder;
};
