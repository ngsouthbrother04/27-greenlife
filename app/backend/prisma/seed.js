const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Users (Admin & Customers)
  const password = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      fullName: 'Admin User',
      password: password,
      role: 'ADMIN',
      phone: '0901234567',
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@gmail.com' },
    update: {},
    create: {
      email: 'customer1@gmail.com',
      fullName: 'Nguyen Van A',
      password: password,
      role: 'CUSTOMER',
      phone: '0909999999',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@gmail.com' },
    update: {},
    create: {
      email: 'customer2@gmail.com',
      fullName: 'Tran Thi B',
      password: password,
      role: 'CUSTOMER',
      phone: '0908888888',
    },
  });

  console.log('Users created');

  // 2. Create Addresses
  await prisma.address.createMany({
    data: [
      { userId: customer1.id, receiver: 'Nguyen Van A', phone: '0909999999', detail: '123 Nguyen Trai, Q1', city: 'Ho Chi Minh', isDefault: true },
      { userId: customer1.id, receiver: 'Nguyen Van A (Office)', phone: '0909999999', detail: '456 Le Loi, Q1', city: 'Ho Chi Minh', isDefault: false },
      { userId: customer2.id, receiver: 'Tran Thi B', phone: '0908888888', detail: '789 Tran Hung Dao, Q5', city: 'Ho Chi Minh', isDefault: true },
    ],
  });

  console.log('Addresses created');

  // 3. Create Categories
  const categories = [
    { name: 'Eco-Friendly Utensils', slug: 'eco-friendly-utensils', description: 'Sustainable alternatives to plastic utensils.' },
    { name: 'Reusable Bags', slug: 'reusable-bags', description: 'Durable bags for shopping and daily use.' },
    { name: 'Personal Care', slug: 'personal-care', description: 'Natural and organic personal care products.' },
    { name: 'Home & Living', slug: 'home-living', description: 'Eco-friendly home decor and essentials.' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 4. Create Products
  const utensilCat = await prisma.category.findUnique({ where: { slug: 'eco-friendly-utensils' } });
  const bagCat = await prisma.category.findUnique({ where: { slug: 'reusable-bags' } });
  const careCat = await prisma.category.findUnique({ where: { slug: 'personal-care' } });

  await prisma.product.createMany({
    data: [
      {
        name: 'Bamboo Toothbrush',
        slug: 'bamboo-toothbrush',
        description: '100% biodegradable bamboo handle.',
        price: 50000,
        stock: 100,
        images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb6dcaf?auto=format&fit=crop&w=800&q=80'],
        categoryId: utensilCat.id,
        averageRating: 4.5,
      },
      {
        name: 'Stainless Steel Straw Set',
        slug: 'stainless-steel-straw-set',
        description: 'Includes 4 straws and a cleaning brush.',
        price: 120000,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=800&q=80'],
        categoryId: utensilCat.id,
        averageRating: 5.0,
      },
      {
        name: 'Cotton Mesh Bag',
        slug: 'cotton-mesh-bag',
        description: 'Perfect for grocery shopping.',
        price: 80000,
        stock: 200,
        images: ['https://plus.unsplash.com/premium_photo-1681488262364-8aeb1b6aac7e?auto=format&fit=crop&w=800&q=80'],
        categoryId: bagCat.id,
        averageRating: 4.0,
      },
      {
        name: 'Organic Soap Bar',
        slug: 'organic-soap-bar',
        description: 'Handmade with natural ingredients.',
        price: 65000,
        stock: 80,
        images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80'],
        categoryId: careCat.id,
        averageRating: 4.8,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Products created');

  // Get Products for referencing
  const products = await prisma.product.findMany();
  const bamboo = products.find(p => p.slug === 'bamboo-toothbrush');
  const straw = products.find(p => p.slug === 'stainless-steel-straw-set');

  // 5. Create Reviews
  if (bamboo && straw) {
    await prisma.review.createMany({
      data: [
        { userId: customer1.id, productId: bamboo.id, rating: 5, comment: 'Great product, love it!' },
        { userId: customer2.id, productId: bamboo.id, rating: 4, comment: 'Good quality but shipping was slow.' },
        { userId: customer1.id, productId: straw.id, rating: 5, comment: 'Very durable and easy to clean.' },
      ],
    });
  }

  console.log('Reviews created');

  // 6. Create Orders
  // Order 1: Completed & Paid (Customer 1)
  const order1 = await prisma.order.create({
    data: {
      userId: customer1.id,
      total: 170000,
      status: 'COMPLETED',
      shippingAddress: '123 Nguyen Trai, Q1, Ho Chi Minh',
      items: {
        create: [
          { productId: bamboo.id, quantity: 1, price: 50000 },
          { productId: straw.id, quantity: 1, price: 120000 },
        ],
      },
      payment: {
        create: {
          method: 'MOMO',
          amount: 170000,
          status: 'SUCCESS',
          transactionCode: 'MOMO12345678',
          paidAt: new Date(),
        },
      },
    },
  });

  // Order 2: Pending (Customer 2)
  const order2 = await prisma.order.create({
    data: {
      userId: customer2.id,
      total: 50000,
      status: 'PENDING',
      shippingAddress: '789 Tran Hung Dao, Q5, Ho Chi Minh',
      items: {
        create: [
          { productId: bamboo.id, quantity: 1, price: 50000 },
        ],
      },
    },
  });

  console.log('Orders created');

  // 7. Create Cart (Customer 2 has items in cart)
  await prisma.cart.create({
    data: {
      userId: customer2.id,
      items: {
        create: [
          { productId: straw.id, quantity: 2 }, // 2 straw sets in cart
        ],
      },
    },
  });

  console.log('Carts created');
  console.log('Seeding finished.');
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
