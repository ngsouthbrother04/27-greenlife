import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cartController from '../controllers/cart.controller.js';
import * as cartService from '../services/cart.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/cart.service.js');

describe('Cart Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { sub: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const mockCart = { id: 1, items: [] };
      cartService.getCart.mockResolvedValue(mockCart);

      await cartController.getCart(req, res, next);

      expect(cartService.getCart).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { cart: mockCart }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      cartService.getCart.mockRejectedValue(error);

      await cartController.getCart(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      req.body = { productId: '10', quantity: '2' };
      const mockCart = { id: 1, items: [{ productId: 10, quantity: 2 }] };
      cartService.addToCart.mockResolvedValue(mockCart);

      await cartController.addToCart(req, res, next);

      expect(cartService.addToCart).toHaveBeenCalledWith(1, 10, 2);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item added to cart',
        data: { cart: mockCart }
      });
    });

    it('should use default quantity 1 if not provided', async () => {
      req.body = { productId: '10' };
      const mockCart = { id: 1 };
      cartService.addToCart.mockResolvedValue(mockCart);

      await cartController.addToCart(req, res, next);

      expect(cartService.addToCart).toHaveBeenCalledWith(1, 10, 1);
    });

    it('should return BAD REQUEST if productId is missing', async () => {
      req.body = { quantity: '2' }; // productId missing

      await cartController.addToCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Product ID is required'
      });
    });

    it('should call next on error', async () => {
      req.body = { productId: '10' };
      const error = new Error('DB error');
      cartService.addToCart.mockRejectedValue(error);

      await cartController.addToCart(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('bulkAddToCart', () => {
    it('should bulk add items', async () => {
      req.body = { items: [{ productId: '10', quantity: '2' }] };
      const mockCart = { id: 1 };
      cartService.bulkAddToCart.mockResolvedValue(mockCart);

      await cartController.bulkAddToCart(req, res, next);

      expect(cartService.bulkAddToCart).toHaveBeenCalledWith(1, [{ productId: 10, quantity: 2 }]);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should return BAD REQUEST if items is missing or not an array', async () => {
      req.body = { items: 'not-an-array' };

      await cartController.bulkAddToCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should call next on error', async () => {
      req.body = { items: [] };
      const error = new Error('DB error');
      cartService.bulkAddToCart.mockRejectedValue(error);

      await cartController.bulkAddToCart(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item', async () => {
      req.body = { productId: '10', quantity: '5' };
      const mockCart = { id: 1 };
      cartService.updateCartItem.mockResolvedValue(mockCart);

      await cartController.updateCartItem(req, res, next);

      expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 10, 5);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should return BAD REQUEST if productId or quantity is missing', async () => {
      req.body = { productId: '10' }; // missing quantity

      await cartController.updateCartItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should call next on error', async () => {
      req.body = { productId: '10', quantity: '5' };
      const error = new Error('DB error');
      cartService.updateCartItem.mockRejectedValue(error);

      await cartController.updateCartItem(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeCartItem', () => {
    it('should remove cart item', async () => {
      req.params.productId = '10';
      const mockCart = { id: 1 };
      cartService.removeCartItem.mockResolvedValue(mockCart);

      await cartController.removeCartItem(req, res, next);

      expect(cartService.removeCartItem).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next on error', async () => {
      req.params.productId = '10';
      const error = new Error('DB error');
      cartService.removeCartItem.mockRejectedValue(error);

      await cartController.removeCartItem(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('clearCart', () => {
    it('should clear cart', async () => {
      cartService.clearCart.mockResolvedValue();

      await cartController.clearCart(req, res, next);

      expect(cartService.clearCart).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Cart cleared',
        data: { cart: { items: [] } }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      cartService.clearCart.mockRejectedValue(error);

      await cartController.clearCart(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
