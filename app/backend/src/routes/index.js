import express from 'express';
import productRoutes from './product.routes.js';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
