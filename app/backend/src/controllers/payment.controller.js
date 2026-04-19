import * as momoService from '../services/momo.service.js';
import { StatusCodes } from 'http-status-codes';

export const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { orderId } = req.body;

    const result = await momoService.createMoMoPayment(orderId, userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const momoCallback = async (req, res, next) => {
  try {
    // MoMo calls this with POST
    await momoService.handleMoMoCallback(req.body);

    // Respond to MoMo to acknowledge receipt (204 No Content is fine, or 200)
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    // Don't leak error details to MoMo, just log it
    console.error('Callback Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

export const simulateMomoPayment = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { orderId, resultCode = 0 } = req.body;

    const result = await momoService.simulateMoMoCallback(orderId, userId, resultCode);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'MoMo payment simulated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
