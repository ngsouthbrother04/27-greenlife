import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(verifyToken);
router.use(authorize(['ADMIN']));

router.get('/', userController.getAll);

export default router;
