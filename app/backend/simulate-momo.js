import crypto from 'crypto';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'MOMO';
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY || 'MOMO';
const SECRET_KEY = process.env.MOMO_SECRET_KEY || 'MOMO';
const IPN_URL = 'http://localhost:3000/api/payments/momo/callback';

const ORDER_ID = process.argv[2];
const AMOUNT = process.argv[3];

if (!ORDER_ID || !AMOUNT) {
  console.log('Usage: node simulate-momo.js <orderId> <amount>');
  process.exit(1);
}

const requestId = `${ORDER_ID}-${new Date().getTime()}`;
const orderIdMomo = requestId;
const orderInfo = `Pay for Order #${ORDER_ID}`;
const orderType = 'momo_wallet';
const transId = Math.floor(Math.random() * 10000000000);
const resultCode = 0; // 0 means SUCCESS
const message = 'Successful.';
const payType = 'qr';
const responseTime = new Date().getTime();
const extraData = '';

const rawSignature = `accessKey=${ACCESS_KEY}&amount=${AMOUNT}&extraData=${extraData}&message=${message}&orderId=${orderIdMomo}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${PARTNER_CODE}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

const signature = crypto.createHmac('sha256', SECRET_KEY).update(rawSignature).digest('hex');

const requestBody = { partnerCode: PARTNER_CODE, orderId: orderIdMomo, requestId, amount: AMOUNT, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature };

console.log(`Sending mock callback for Order ${ORDER_ID} with amount ${AMOUNT}...`);

axios.post(IPN_URL, requestBody)
  .then(res => console.log('Success!', res.status, res.data))
  .then(res => console.log(`http://localhost:5173/return-url?resultCode=0&orderId=${ORDER_ID}`))
  .catch(err => console.error('Error:', err.response ? err.response.data : err.message));
