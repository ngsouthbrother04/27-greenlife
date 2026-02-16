/**
 * API Services Export
 * 
 * Centralized export for all API services.
 * Components should import from here instead of individual files.
 * 
 * Usage:
 * import { productService, orderService, paymentService } from '@/api';
 */

import axiosClient from './axiosClient';
import productService from './productService';
import orderService from './orderService';
import paymentService from './paymentService';
import categoryService from './categoryService';
import authService from './authService';
import uploadService from './uploadService';
import cartService from './cartService';
import userService from './userService';
import wishlistService from './wishlistService';

export {
  axiosClient,
  productService,
  orderService,
  paymentService,
  categoryService,
  authService,
  uploadService,
  cartService,
  userService,
  wishlistService
};
