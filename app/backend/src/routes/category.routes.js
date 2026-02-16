import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);

// Admin
router.post('/', verifyToken, authorize(['ADMIN']), categoryController.createCategory);
router.put('/:id', verifyToken, authorize(['ADMIN']), categoryController.updateCategory);
router.delete('/:id', verifyToken, authorize(['ADMIN']), categoryController.deleteCategory);

export default router;
