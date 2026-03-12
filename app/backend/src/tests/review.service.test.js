import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      order: {
        findFirst: vi.fn()
      },
      review: {
        create: vi.fn(),
        aggregate: vi.fn(),
        findMany: vi.fn()
      },
      product: {
        update: vi.fn()
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

import * as reviewService from '../services/review.service.js';

describe('Review Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addReview', () => {
    const userId = 1;
    const productId = 5;
    const rating = 4;
    const comment = 'Good product';

    it('should allow review if user has COMPLETED order', async () => {
      // First check (COMPLETED)
      mockPrisma.order.findFirst.mockResolvedValue({ id: 100, status: 'COMPLETED' });
      mockPrisma.review.create.mockResolvedValue({ id: 10, rating, comment });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });

      const result = await reviewService.addReview(userId, productId, rating, comment);

      expect(result.id).toBe(10);
      expect(mockPrisma.review.create).toHaveBeenCalledWith({
        data: { userId, productId, rating, comment }
      });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { averageRating: 4.5 }
      });
    });

    it('should allow review if user has PAID/DELIVERED order', async () => {
      // First check (COMPLETED) fails
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        // Second check (PAID/DELIVERED/COMPLETED) succeeds
        .mockResolvedValueOnce({ id: 101, status: 'PAID' });
      
      mockPrisma.review.create.mockResolvedValue({ id: 11 });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4 } });

      await reviewService.addReview(userId, productId, rating, comment);

      expect(mockPrisma.review.create).toHaveBeenCalled();
    });

    it('should throw FORBIDDEN if user has not purchased product', async () => {
      // Both checks fail
      mockPrisma.order.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(reviewService.addReview(userId, productId, rating, comment)).rejects.toThrow(ApiError);
      
      try {
        await reviewService.addReview(userId, productId, rating, comment);
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.FORBIDDEN);
        expect(err.message).toBe('You must purchase and receive this product to review it');
      }
    });

    it('should update product with 0 average rating if aggregate returns null', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 100, status: 'COMPLETED' });
      mockPrisma.review.create.mockResolvedValue({ id: 10 });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } });

      await reviewService.addReview(userId, productId, rating, comment);

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { averageRating: 0 }
      });
    });
  });

  describe('getProductReviews', () => {
    it('should return list of reviews', async () => {
      const mockReviews = [{ id: 1, comment: 'Nice' }];
      mockPrisma.review.findMany.mockResolvedValue(mockReviews);

      const result = await reviewService.getProductReviews(5);
      
      expect(result).toEqual(mockReviews);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
        where: { productId: 5 },
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' }
      });
    });
  });
});
