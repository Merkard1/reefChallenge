import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function main() {
  const productsData = [
    {
      name: 'Product 1',
      description: 'Description for Product 1',
      price: 100.0,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLCweiJVxf9wQbL37BD7c0XqKe-GBT4UmP6C5CQE_-e5Vb6nPzdxZiWA32tg5VViQnk4A&usqp=CAU',
    },
    {
      name: 'Product 2',
      description: 'Description for Product 2',
      price: 90.0,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLCweiJVxf9wQbL37BD7c0XqKe-GBT4UmP6C5CQE_-e5Vb6nPzdxZiWA32tg5VViQnk4A&usqp=CAU',
    },
    {
      name: 'Product 3',
      description: 'Description for Product 3',
      price: 36.0,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLCweiJVxf9wQbL37BD7c0XqKe-GBT4UmP6C5CQE_-e5Vb6nPzdxZiWA32tg5VViQnk4A&usqp=CAU',
    },
    {
      name: 'Product 4',
      description: 'Description for Product 4',
      price: 70.0,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLCweiJVxf9wQbL37BD7c0XqKe-GBT4UmP6C5CQE_-e5Vb6nPzdxZiWA32tg5VViQnk4A&usqp=CAU',
    },
    {
      name: 'Product 5',
      description: 'Description for Product 5',
      price: 55.0,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLCweiJVxf9wQbL37BD7c0XqKe-GBT4UmP6C5CQE_-e5Vb6nPzdxZiWA32tg5VViQnk4A&usqp=CAU',
    },
    {
      name: 'Product 6',
      description: 'Description for Product 6',
      price: 20.0,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLCweiJVxf9wQbL37BD7c0XqKe-GBT4UmP6C5CQE_-e5Vb6nPzdxZiWA32tg5VViQnk4A&usqp=CAU',
    },
  ];

  // Delete dependent records in proper order.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  // Delete existing users (if any) and products.
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  console.log('Existing products, orders, order items, and users deleted.');

  // Create the admin user.
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('admin', saltRounds);
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      roles: ['USER', 'ADMIN'],
    },
  });
  console.log('Admin user created: admin@example.com with password "admin"');

  // Seed products.
  for (const productData of productsData) {
    await prisma.product.create({ data: productData });
  }
  console.log('Seed data created: 6 products');

  // Seed random orders with random order dates.
  const products = await prisma.product.findMany();
  if (!products.length) {
    console.log('No products found; skipping random orders seeding.');
    return;
  }

  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const statuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];
  const getRandom = (array: any[]) =>
    array[Math.floor(Math.random() * array.length)];

  // Define a date range: orders from 30 days ago until today.
  const now = new Date();
  const startDateRange = new Date(now);
  startDateRange.setDate(startDateRange.getDate() - 30);

  for (let i = 0; i < 5; i++) {
    const customerName = getRandom(names);
    const status = getRandom(statuses);
    const numberOfItems = Math.floor(Math.random() * 3) + 1;

    const orderItemsData = [];
    for (let j = 0; j < numberOfItems; j++) {
      const randomProduct = getRandom(products);
      const randomQuantity = Math.floor(Math.random() * 5) + 1;
      orderItemsData.push({
        productId: randomProduct.id,
        quantity: randomQuantity,
        price: randomProduct.price,
      });
    }

    // Generate a random order date within the last 30 days.
    const randomOrderDate = randomDate(startDateRange, now);

    await prisma.order.create({
      data: {
        customerName,
        status,
        orderDate: randomOrderDate,
        orderItems: {
          create: orderItemsData,
        },
      },
    });
  }

  console.log('Seed data created: 5 random orders with varied order dates');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
