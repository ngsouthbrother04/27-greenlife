import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productController from '../controllers/product.controller.js';
import * as productService from '../services/product.service.js';
import * as reviewService from '../services/review.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/product.service.js');
vi.mock('../services/review.service.js');

describe('Product Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {}, user: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return a list of products', async () => {
      const mockProducts = [{ id: 1, name: 'Product A' }, { id: 2, name: 'Product B' }];
      const mockPagination = { page: 1, limit: 12, total: 2, totalPages: 1 };

      productService.getAllProducts.mockResolvedValue({
        products: mockProducts,
        pagination: mockPagination
      });

      await productController.getProducts(req, res, next);

      expect(productService.getAllProducts).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockProducts.length,
        data: { products: mockProducts },
        pagination: mockPagination
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getProduct (ById)', () => {
    it('should return a single product by ID', async () => {
      req.params.id = '1';
      const mockProduct = { id: 1, name: 'Product A' };
      productService.getProductById.mockResolvedValue(mockProduct);

      await productController.getProduct(req, res, next);

      expect(productService.getProductById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { product: mockProduct }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should trigger next(error) if product not found', async () => {
      req.params.id = '999';
      const error = new Error('Not found');
      productService.getProductById.mockRejectedValue(error);

      await productController.getProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addReview', () => {
    it('should add a review and return 201', async () => {
      req.user = { sub: 1 }; // From auth middleware
      req.params = { id: '10' };
      req.body = { rating: 5, comment: 'Great!' };

      const mockReview = { id: 1, productId: 10, userId: 1, rating: 5, comment: 'Great!' };
      reviewService.addReview.mockResolvedValue(mockReview);

      await productController.addReview(req, res, next);

      expect(reviewService.addReview).toHaveBeenCalledWith(1, '10', 5, 'Great!');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { review: mockReview }
      });
    });
  });
});
