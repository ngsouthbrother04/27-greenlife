import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 1. Routes common for authenticated users
router.use(verifyToken);

// Profile
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.changePassword);

// Addresses
router.get('/me/addresses', userController.getAddresses);
router.post('/me/addresses', userController.addAddress);
router.put('/me/addresses/:id', userController.updateAddress);
router.delete('/me/addresses/:id', userController.deleteAddress);
router.post('/me/addresses/:id/set-default', userController.setDefaultAddress);

// 2. Admin Routes
router.get('/', authorize(['ADMIN']), userController.getAll);

export default router;
