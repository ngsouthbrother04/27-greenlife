import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: Random date between two dates
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Random integer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate an array of Dates in the last 12 months, with higher density in recent months
function generateRandomDates(count) {
  const dates = [];
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  for (let i = 0; i < count; i++) {
    // 60% chance for last 3 months, 40% chance for older
    const isRecent = Math.random() > 0.4;

    if (isRecent) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      dates.push(getRandomDate(threeMonthsAgo, now));
    } else {
      dates.push(getRandomDate(oneYearAgo, now));
    }
  }
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

async function main() {
  console.log('Seeding fake statistics data...');

  // 1. Check existing products to create order items
  const products = await prisma.product.findMany();

  if (products.length === 0) {
    console.error('No products found! Please run the main seed first to create products.');
    process.exit(1);
  }

  // 2. Generate Fake Customers spread out over 12 months
  console.log('Creating 50 fake customers...');
  const password = await bcrypt.hash('123456', 10);
  const userDates = generateRandomDates(50);
  const createdUsers = [];

  for (let i = 0; i < userDates.length; i++) {
    const user = await prisma.user.create({
      data: {
        email: `fake_customer_${i}_${Date.now()}@gmail.com`,
        fullName: `Khách hàng Ảo ${i + 1}`,
        password: password,
        role: 'CUSTOMER',
        phone: `09${getRandomInt(10000000, 99999999)}`,
        createdAt: userDates[i],
        updatedAt: userDates[i]
      }
    });
    createdUsers.push(user);

    // Create Default Address for them
    await prisma.address.create({
      data: {
        userId: user.id,
        receiver: user.fullName,
        phone: user.phone,
        detail: `Số ${getRandomInt(1, 999)} Đường ABC, Phường XYZ`,
        city: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'][getRandomInt(0, 3)],
        isDefault: true
      }
    });
  }

  // 3. Generate Fake Orders (Completed / Paid MOMO) to affect Revenue
  console.log('Creating 150 fake orders...');
  const orderDates = generateRandomDates(150);

  for (let i = 0; i < orderDates.length; i++) {
    const isMomo = Math.random() > 0.5;
    const isCompleted = Math.random() > 0.3; // 70% completed, 30% others
    const status = isCompleted ? 'COMPLETED' : (isMomo ? 'PAID' : 'PENDING');

    const randomUser = createdUsers[getRandomInt(0, createdUsers.length - 1)];
    const numItems = getRandomInt(1, 4);

    // Pick random products
    const orderItemsBuilder = [];
    let orderTotal = 0;

    for (let j = 0; j < numItems; j++) {
      const p = products[getRandomInt(0, products.length - 1)];
      const qty = getRandomInt(1, 3);
      orderTotal += Number(p.price) * qty;

      orderItemsBuilder.push({
        productId: p.id,
        quantity: qty,
        price: p.price
      });
    }

    // Shipping cost randomly
    orderTotal += getRandomInt(1, 4) * 10000;

    // Create Order with overwitten dates
    const createdOrder = await prisma.order.create({
      data: {
        userId: randomUser.id,
        total: orderTotal,
        status: status,
        shippingAddress: {
          detail: `Số ${getRandomInt(1, 999)} Đường Fake, Quận ${getRandomInt(1, 12)}, TP Fake`
        },
        items: {
          create: orderItemsBuilder
        },
        createdAt: orderDates[i],
        updatedAt: orderDates[i]
      }
    });

    // Create Payment if order is PAID or COMPLETED
    if (status === 'COMPLETED' || status === 'PAID') {
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          method: isMomo ? 'MOMO' : 'COD',
          amount: orderTotal,
          status: 'SUCCESS',
          paidAt: orderDates[i],
          createdAt: orderDates[i]
        }
      });
    }
  }

  console.log('Successfully seeded 50 users and 150 orders spanning 12 months!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
