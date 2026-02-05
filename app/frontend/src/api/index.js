/**
 * API Services Export
 * 
 * Centralized export for all API services.
 * Components should import from here instead of individual files.
 * 
 * Usage:
 * import { productService, orderService, paymentService } from '@/api';
 */

export { default as axiosClient } from './axiosClient';
export { default as productService } from './productService';
export { default as orderService } from './orderService';
export { default as paymentService } from './paymentService';
