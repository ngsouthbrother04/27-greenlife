import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public Routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Review Routes
router.get('/:id/reviews', productController.getReviews);
router.post('/:id/reviews', verifyToken, productController.addReview);

// Admin Routes
router.post('/', verifyToken, authorize(['ADMIN']), productController.createProduct);
router.put('/:id', verifyToken, authorize(['ADMIN']), productController.updateProduct);
router.delete('/:id', verifyToken, authorize(['ADMIN']), productController.deleteProduct);

export default router;
