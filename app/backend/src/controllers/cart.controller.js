import * as cartService from '../services/cart.service.js';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const cart = await cartService.getCart(userId);
    console.log('DEBUG: Sending Cart Data:', JSON.stringify(cart, null, 2)); // Log entire cart
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { productId, quantity } = req.body;

    // Basic validation
    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }

    const cart = await cartService.addToCart(userId, parseInt(productId), parseInt(quantity || 1));
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Item added to cart',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const bulkAddToCart = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { items } = req.body; // Expect { items: [{ productId, quantity }] }

    if (!items || !Array.isArray(items)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Items array is required'
      });
    }

    // Convert types for all items
    const sanitizedItems = items.map(item => ({
      productId: parseInt(item.productId),
      quantity: parseInt(item.quantity)
    }));

    const cart = await cartService.bulkAddToCart(userId, sanitizedItems);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Items added to cart',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Product ID and quantity are required'
      });
    }

    const cart = await cartService.updateCartItem(userId, parseInt(productId), parseInt(quantity));
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Cart updated',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { productId } = req.params;

    const cart = await cartService.removeCartItem(userId, parseInt(productId));
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    await cartService.clearCart(userId);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Cart cleared',
      data: { cart: { items: [] } }
    });
  } catch (error) {
    next(error);
  }
};
