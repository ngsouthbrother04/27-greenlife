import * as orderService from '../services/order.service.js';
import { StatusCodes } from 'http-status-codes';

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { shippingAddress, note, items, totalAmount } = req.body;

    const order = await orderService.createOrder(userId, shippingAddress, note, items, totalAmount);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const result = await orderService.getUserOrders(userId, req.query);

    res.status(StatusCodes.OK).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const order = await orderService.getOrderById(userId, req.params.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const order = await orderService.cancelOrder(userId, req.params.id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
