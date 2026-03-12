import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      cart: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      cartItem: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn()
      },
      product: {
        findUnique: vi.fn()
      }
    }
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function() {
      return mockPrisma;
    }
  };
});

import * as cartService from '../services/cart.service.js';

describe('Cart Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    const userId = 1;

    it('should return existing cart and its items', async () => {
      const mockCart = { id: 10, userId, items: [{ id: 1 }] };
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);

      const cart = await cartService.getCart(userId);
      expect(cart).toEqual(mockCart);
      expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object)
      });
    });

    it('should create and return a new empty cart if one does not exist', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      mockPrisma.cart.create.mockResolvedValue({ id: 11, userId });

      const cart = await cartService.getCart(userId);
      expect(cart).toEqual({ id: 11, userId, items: [] });
      expect(mockPrisma.cart.create).toHaveBeenCalledWith({
        data: { userId },
        include: { items: true }
      });
    });
  });

  describe('addToCart', () => {
    const userId = 1;
    const productId = 5;

    beforeEach(() => {
      // Setup default getCart mock since addToCart returns getCart() output
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10, userId, items: [] });
    });

    it('should throw NOT FOUND if product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(cartService.addToCart(userId, productId)).rejects.toThrow(ApiError);
    });

    it('should throw BAD REQUEST if not enough stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 0 });
      await expect(cartService.addToCart(userId, productId, 2)).rejects.toThrow(ApiError);
    });

    it('should create new cartItem if product not in cart', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 10 });
      mockPrisma.cartItem.findUnique.mockResolvedValue(null); // Not in cart

      // To handle getCart call at the end
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce({ id: 10, userId }) // For cart fetching logic
        .mockResolvedValueOnce({ id: 10, userId, items: [{ productId }] }) // For final getCart()

      await cartService.addToCart(userId, productId, 2);

      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
        data: { cartId: 10, productId, quantity: 2 }
      });
    });

    it('should update cartItem quantity if product already exists in cart', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 10 });
      mockPrisma.cartItem.findUnique.mockResolvedValue({ id: 100, quantity: 3 }); // Currently has 3

      // cart service calls getCart at end, mock accordingly
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce({ id: 10, userId })
        .mockResolvedValueOnce({ id: 10, userId, items: [{}] });

      await cartService.addToCart(userId, productId, 2);

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { quantity: 5 }
      });
    });

    it('should throw BAD REQUEST if resulting total quantity exceeds stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 4 });
      mockPrisma.cartItem.findUnique.mockResolvedValue({ id: 100, quantity: 3 });

      // Try adding 2 more, total = 5 > stock (4)
      await expect(cartService.addToCart(userId, productId, 2)).rejects.toThrow(ApiError);
    });

    it('should create cart first if user has no cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValueOnce(null); // user has no cart
      mockPrisma.cart.create.mockResolvedValue({ id: 20 });
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 10 });
      mockPrisma.cartItem.findUnique.mockResolvedValue(null); 
      
      // End call mock
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 20, items: [] });

      await cartService.addToCart(userId, productId, 1);
      
      expect(mockPrisma.cart.create).toHaveBeenCalledWith({ data: { userId } });
      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ cartId: 20 })
      }));
    });
  });

  describe('bulkAddToCart', () => {
    it('should iterate elements and call addToCart logic', async () => {
        // Since bulkAddToCart calls addToCart internally, we can't easily spy on addToCart without proxyquire or vi.mock for current module.
        // We'll trust integration tests more for this, but unit test will mock the DB calls simulating multiple addToCart executions.
        mockPrisma.cart.findUnique.mockResolvedValue({ id: 10 });
        mockPrisma.product.findUnique.mockResolvedValue({ id: 1, stock: 10 });
        mockPrisma.cartItem.findUnique.mockResolvedValue(null);

        await cartService.bulkAddToCart(1, [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1}]);
        
        expect(mockPrisma.cartItem.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateCartItem', () => {
    const userId = 1;
    const productId = 5;

    it('should throw NOT FOUND if cart is missing', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      await expect(cartService.updateCartItem(userId, productId, 2)).rejects.toThrow(ApiError);
    });

    it('should call removeCartItem if quantity <= 0', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10, userId });
      mockPrisma.cartItem.delete.mockResolvedValue({});
      
      await cartService.updateCartItem(userId, productId, 0);

      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: 10, productId } }
      });
    });

    it('should throw NOT FOUND if product does not exist', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(cartService.updateCartItem(userId, productId, 2)).rejects.toThrow(ApiError);
    });

    it('should throw BAD REQUEST if quantity exceeds stock', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 1 }); // only 1 in stock

      await expect(cartService.updateCartItem(userId, productId, 5)).rejects.toThrow(ApiError);
    });

    it('should update cartItem quantity correctly', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.product.findUnique.mockResolvedValue({ id: productId, stock: 10 });

      // Final getCart return
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce({ id: 10 })
        .mockResolvedValueOnce({ id: 10, items: [] });

      await cartService.updateCartItem(userId, productId, 5);

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: 10, productId } },
        data: { quantity: 5 }
      });
    });
  });

  describe('removeCartItem', () => {
    const userId = 1;

    it('should throw error if cart not found', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      await expect(cartService.removeCartItem(userId, 5)).rejects.toThrow(ApiError);
    });

    it('should delete item from cart', async () => {
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce({ id: 10, userId })
        .mockResolvedValueOnce({ id: 10, items: [] });
      
      await cartService.removeCartItem(userId, 5);

      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: 10, productId: 5 } }
      });
    });

    it('should ignore P2025 error if item already removed', async () => {
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce({ id: 10 })
        .mockResolvedValueOnce({ id: 10, items: [] });
      
      const errorP2025 = new Error('Not found');
      errorP2025.code = 'P2025';
      mockPrisma.cartItem.delete.mockRejectedValue(errorP2025);

      await expect(cartService.removeCartItem(userId, 5)).resolves.not.toThrow();
    });

    it('should rethrow non-P2025 errors', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10 });
      const genericError = new Error('DB failure');
      mockPrisma.cartItem.delete.mockRejectedValue(genericError);

      await expect(cartService.removeCartItem(userId, 5)).rejects.toThrow('DB failure');
    });
  });

  describe('clearCart', () => {
    it('should do nothing if cart does not exist', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      await cartService.clearCart(1);
      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete all cart items if cart exists', async () => {
      mockPrisma.cart.findUnique
        .mockResolvedValueOnce({ id: 10 })
        .mockResolvedValueOnce({ id: 10, items: [] });
      
      await cartService.clearCart(1);

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 10 } });
    });
  });
});
