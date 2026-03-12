import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mPrisma = {
    product: {
      findUnique: vi.fn(),
    },
    wishlist: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  };
  return {
    PrismaClient: class {
      constructor() {
        return mPrisma;
      }
    }
  };
});

const prisma = new PrismaClient();

describe('Wishlist Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { sub: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      req.body = { productId: '10' };
      prisma.product.findUnique.mockResolvedValue({ id: 10 });
      prisma.wishlist.findUnique.mockResolvedValue(null);
      const mockWishlist = { id: 1, userId: 1, productId: 10 };
      prisma.wishlist.create.mockResolvedValue(mockWishlist);

      await wishlistController.addToWishlist(req, res, next);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({ where: { userId_productId: { userId: 1, productId: 10 } } });
      expect(prisma.wishlist.create).toHaveBeenCalledWith({ data: { userId: 1, productId: 10 } });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product added to wishlist',
        data: { wishlist: mockWishlist }
      });
    });

    it('should return 400 if productId missing', async () => {
      req.body = {};

      await wishlistController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: StatusCodes.BAD_REQUEST }));
    });

    it('should return 404 if product not found', async () => {
      req.body = { productId: '10' };
      prisma.product.findUnique.mockResolvedValue(null);

      await wishlistController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: StatusCodes.NOT_FOUND }));
    });

    it('should return OK if already in wishlist', async () => {
      req.body = { productId: '10' };
      prisma.product.findUnique.mockResolvedValue({ id: 10 });
      const mockWishlist = { id: 1, userId: 1, productId: 10 };
      prisma.wishlist.findUnique.mockResolvedValue(mockWishlist); // existing

      await wishlistController.addToWishlist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product already in wishlist',
        data: { wishlist: mockWishlist }
      });
    });

    it('should call next on generic error', async () => {
      req.body = { productId: '10' };
      const err = new Error('DB Error');
      prisma.product.findUnique.mockRejectedValue(err);

      await wishlistController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', async () => {
      req.params.id = '10';
      prisma.wishlist.delete.mockResolvedValue({});

      await wishlistController.removeFromWishlist(req, res, next);

      expect(prisma.wishlist.delete).toHaveBeenCalledWith({
        where: { userId_productId: { userId: 1, productId: 10 } }
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should handle P2025 error (not found) and return 200 OK', async () => {
      req.params.id = '10';
      const error = new Error('Not found');
      error.code = 'P2025';
      prisma.wishlist.delete.mockRejectedValue(error);

      await wishlistController.removeFromWishlist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product removed from wishlist'
      });
    });

    it('should call next on other errors', async () => {
      req.params.id = '10';
      const err = new Error('DB Error');
      prisma.wishlist.delete.mockRejectedValue(err);

      await wishlistController.removeFromWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getWishlist', () => {
    it('should return user wishlist', async () => {
      const mockWishlist = [{ id: 1 }, { id: 2 }];
      prisma.wishlist.findMany.mockResolvedValue(mockWishlist);

      await wishlistController.getWishlist(req, res, next);

      expect(prisma.wishlist.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'desc' }
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { wishlist: mockWishlist }
      });
    });

    it('should call next on error', async () => {
      const err = new Error('DB Error');
      prisma.wishlist.findMany.mockRejectedValue(err);

      await wishlistController.getWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('checkWishlistStatus', () => {
    it('should return true if in wishlist', async () => {
      req.params.id = '10';
      prisma.wishlist.findUnique.mockResolvedValue({ id: 1 });

      await wishlistController.checkWishlistStatus(req, res, next);

      expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
        where: { userId_productId: { userId: 1, productId: 10 } }
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { isWishlisted: true }
      });
    });

    it('should return false if not in wishlist', async () => {
      req.params.id = '10';
      prisma.wishlist.findUnique.mockResolvedValue(null);

      await wishlistController.checkWishlistStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { isWishlisted: false }
      });
    });

    it('should call next on error', async () => {
      req.params.id = '10';
      const err = new Error('DB Error');
      prisma.wishlist.findUnique.mockRejectedValue(err);

      await wishlistController.checkWishlistStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
