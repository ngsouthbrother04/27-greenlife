import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create Payment requires Auth
router.post('/momo/create', verifyToken, paymentController.createPayment);
router.post('/momo/simulate', verifyToken, paymentController.simulateMomoPayment);

// Callback must be PUBLIC (no auth middleware)
router.post('/momo/callback', paymentController.momoCallback);

export default router;
