import express from 'express';
import * as authController from '../controllers/auth.controller.js';
// import { validateRegister, validateLogin } from '../middlewares/validation.middleware.js'; // TODO: Validation

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
