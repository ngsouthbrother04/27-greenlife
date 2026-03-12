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
    req = { params: {}, body: {}, query: {}, user: { sub: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      req.query = { page: 1 };
      const mockResult = { products: [{ id: 1 }], pagination: { current: 1 } };
      productService.getAllProducts.mockResolvedValue(mockResult);

      await productController.getProducts(req, res, next);

      expect(productService.getAllProducts).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: { products: mockResult.products },
        pagination: mockResult.pagination
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      productService.getAllProducts.mockRejectedValue(error);

      await productController.getProducts(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTrendingProducts', () => {
    it('should return trending products with default limit', async () => {
      const mockProducts = [{ id: 1 }, { id: 2 }];
      productService.getTopSellingProducts.mockResolvedValue(mockProducts);

      await productController.getTrendingProducts(req, res, next);

      expect(productService.getTopSellingProducts).toHaveBeenCalledWith(6);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { products: mockProducts }
      });
    });

    it('should return trending products with custom limit', async () => {
      req.query.limit = '10';
      const mockProducts = [{ id: 1 }];
      productService.getTopSellingProducts.mockResolvedValue(mockProducts);

      await productController.getTrendingProducts(req, res, next);

      expect(productService.getTopSellingProducts).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      productService.getTopSellingProducts.mockRejectedValue(error);

      await productController.getTrendingProducts(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProduct', () => {
    it('should get a product', async () => {
      req.params.id = '1';
      const mockProduct = { id: 1 };
      productService.getProductById.mockResolvedValue(mockProduct);

      await productController.getProduct(req, res, next);

      expect(productService.getProductById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { product: mockProduct }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      productService.getProductById.mockRejectedValue(error);

      await productController.getProduct(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      req.body = { name: 'New Product' };
      const mockProduct = { id: 1, name: 'New Product' };
      productService.createProduct.mockResolvedValue(mockProduct);

      await productController.createProduct(req, res, next);

      expect(productService.createProduct).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product created successfully',
        data: { product: mockProduct }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      productService.createProduct.mockRejectedValue(error);

      await productController.createProduct(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated Product' };
      const mockProduct = { id: 1, name: 'Updated Product' };
      productService.updateProduct.mockResolvedValue(mockProduct);

      await productController.updateProduct(req, res, next);

      expect(productService.updateProduct).toHaveBeenCalledWith('1', req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product updated successfully',
        data: { product: mockProduct }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      productService.updateProduct.mockRejectedValue(error);

      await productController.updateProduct(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      req.params.id = '1';
      productService.deleteProduct.mockResolvedValue();

      await productController.deleteProduct(req, res, next);

      expect(productService.deleteProduct).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product deleted successfully'
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      productService.deleteProduct.mockRejectedValue(error);

      await productController.deleteProduct(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addReview', () => {
    it('should add a review', async () => {
      req.params.id = '1';
      req.body = { rating: 5, comment: 'Great' };
      const mockReview = { id: 10, rating: 5, comment: 'Great' };
      reviewService.addReview.mockResolvedValue(mockReview);

      await productController.addReview(req, res, next);

      expect(reviewService.addReview).toHaveBeenCalledWith(1, '1', 5, 'Great');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { review: mockReview }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      reviewService.addReview.mockRejectedValue(error);

      await productController.addReview(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getReviews', () => {
    it('should get reviews for a product', async () => {
      req.params.id = '1';
      const mockReviews = [{ id: 1 }, { id: 2 }];
      reviewService.getProductReviews.mockResolvedValue(mockReviews);

      await productController.getReviews(req, res, next);

      expect(reviewService.getProductReviews).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { reviews: mockReviews }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      reviewService.getProductReviews.mockRejectedValue(error);

      await productController.getReviews(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
