import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

// MoMo Sandbox Config (Should be in env, but hardcoding for demo/sandbox default)
// MoMo Sandbox Config
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
const SECRET_KEY = process.env.MOMO_SECRET_KEY;
const REDIRECT_URL = process.env.MOMO_REDIRECT_URL;
const IPN_URL = process.env.MOMO_IPN_URL;

/**
 * Create MoMo Payment URL
 */
export const createMoMoPayment = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Unauthorized');
  }

  // Create Payment Record
  let payment = await prisma.payment.findUnique({
    where: { orderId }
  });

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        orderId,
        method: 'MOMO',
        amount: order.total,
        status: 'PENDING'
      }
    });
  }

  // MoMo Params
  const requestId = `${orderId}-${new Date().getTime()}`;
  const orderInfo = `Pay for Order #${orderId}`;
  const requestType = 'captureWallet';
  const amount = Number(order.total).toString();
  const orderIdMomo = requestId; // Unique orderId for MoMo
  const extraData = '';

  // Signature
  const rawSignature = `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${IPN_URL}&orderId=${orderIdMomo}&orderInfo=${orderInfo}&partnerCode=${PARTNER_CODE}&redirectUrl=${REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  // Request Body
  const requestBody = {
    partnerCode: PARTNER_CODE,
    partnerName: 'GreenLife Store',
    storeId: 'MomoStore',
    requestId,
    amount,
    orderId: orderIdMomo,
    orderInfo,
    redirectUrl: REDIRECT_URL,
    ipnUrl: IPN_URL,
    lang: 'vi',
    requestType,
    autoCapture: true,
    extraData,
    signature
  };

  try {
    const response = await axios.post(MOMO_ENDPOINT, requestBody);
    return response.data; // { payUrl, ... }
  } catch (error) {
    console.error('MoMo Create Error:', error.response?.data || error.message);
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to create MoMo payment');
  }
};

/**
 * Handle MoMo Callback (IPN)
 */
export const handleMoMoCallback = async (data) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = data;

  // Verify Signature
  const rawSignature = `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('❌ Invalid MoMo Signature');
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid signature');
  }

  // Extract internal Order ID from requestId (format: orderId-timestamp)
  const internalOrderId = parseInt(requestId.split('-')[0]);

  if (resultCode === 0) {
    // SUCCESS
    await prisma.$transaction(async (tx) => {
      // 1. Update Payment
      await tx.payment.update({
        where: { orderId: internalOrderId },
        data: {
          status: 'SUCCESS',
          transactionCode: transId.toString(),
          paidAt: new Date()
        }
      });

      // 2. Update Order
      const order = await tx.order.update({
        where: { id: internalOrderId },
        data: { status: 'PAID' },
        include: { items: true }
      });

      // 3. Deduct Stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }
    });

    console.log(`✅ Payment Success for Order #${internalOrderId}`);
  } else {
    // FAILED
    await prisma.$transaction(async (tx) => {
      // 1. Update Payment Status
      await tx.payment.update({
        where: { orderId: internalOrderId },
        data: { status: 'FAILED' }
      });

      // 2. Cancel Order
      await tx.order.update({
        where: { id: internalOrderId },
        data: { status: 'CANCELLED' }
      });
    });

    console.log(`❌ Payment Failed/Expired for Order #${internalOrderId}. Order Cancelled.`);
  }

  return { message: 'Callback received' };
};
