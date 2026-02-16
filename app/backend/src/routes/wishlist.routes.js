import express from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:id', wishlistController.removeFromWishlist);
router.get('/:id/status', wishlistController.checkWishlistStatus);

export default router;
