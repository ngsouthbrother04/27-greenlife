import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all admin routes
router.use(verifyToken);
router.use(authorize(['ADMIN']));

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// Order Management
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.delete('/orders/:id', adminController.deleteOrder);

// Product Management
router.get('/products', adminController.getAllProducts);
router.put('/products/:id/status', adminController.updateProductStatus);

export default router;
