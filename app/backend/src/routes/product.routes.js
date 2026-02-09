import express from 'express';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

export default router;
