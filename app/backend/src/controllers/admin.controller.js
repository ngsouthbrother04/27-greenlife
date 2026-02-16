import * as adminService from '../services/admin.service.js';
import { StatusCodes } from 'http-status-codes';

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { orders, pagination } = await adminService.getAllOrders(req.query);
    res.status(StatusCodes.OK).json({
      status: 'success',
      results: orders.length,
      data: { orders },
      pagination
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await adminService.updateOrderStatus(id, status);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await adminService.getOrder(id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteOrder(id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
