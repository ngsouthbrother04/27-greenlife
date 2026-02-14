import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Get user's cart with items and product details
 */
export const getCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              slug: true,
              stock: true
            }
          }
        },
        orderBy: { id: 'asc' }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true }
    });
    // Return empty cart structure consistent with found cart
    return { ...cart, items: [] };
  }

  return cart;
};

/**
 * Add item to cart
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  // 1. Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // 2. Check product existence and stock
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough stock');
  }

  // 3. Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: productId
      }
    }
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough stock for total quantity');
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity }
    });
  } else {
    // Create new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      }
    });
  }

  // Return updated cart
  return getCart(userId);
};

/**
 * Bulk add items to cart
 */
export const bulkAddToCart = async (userId, items) => {
  // Items: array of { productId, quantity }
  for (const item of items) {
    await addToCart(userId, item.productId, item.quantity);
  }
  return getCart(userId);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (userId, productId, quantity) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');

  if (quantity <= 0) {
    return removeCartItem(userId, productId);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  if (product.stock < quantity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough stock');
  }

  await prisma.cartItem.update({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: productId
      }
    },
    data: { quantity }
  });

  return getCart(userId);
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (userId, productId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');

  try {
    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      }
    });
  } catch (error) {
    // Check if error is due to record not found, ignore if so
    if (error.code !== 'P2025') {
      throw error;
    }
  }

  return getCart(userId);
};

/**
 * Clear cart
 */
export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  return getCart(userId);
};
