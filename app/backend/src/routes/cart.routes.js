import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.post('/bulk', cartController.bulkAddToCart);
router.put('/', cartController.updateCartItem);
router.delete('/:productId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

export default router;
