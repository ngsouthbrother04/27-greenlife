import * as productService from '../services/product.service.js';
import * as reviewService from '../services/review.service.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Get all products (Public)
 * Support pagination, filtering, sorting
 */
export const getProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getAllProducts(req.query);

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: products.length,
      data: { products },
      pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID (Public)
 */
export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Product (Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Product (Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Product (Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Review
 */
export const addReview = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await reviewService.addReview(userId, id, rating, comment);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reviews
 */
export const getReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await reviewService.getProductReviews(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};
