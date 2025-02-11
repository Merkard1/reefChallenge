import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeederService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  private randomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
  }

  async seed(): Promise<void> {
    const productsCount = await this.prisma.product.count();
    if (productsCount > 0) {
      this.logger.log('Seeding skipped: Products already exist');
      return;
    }

    this.logger.log('Seeding database...');

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
    await this.prisma.orderItem.deleteMany();
    await this.prisma.order.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.product.deleteMany();

    this.logger.log(
      'Existing products, orders, order items, and users deleted.',
    );

    for (const productData of productsData) {
      await this.prisma.product.create({ data: productData });
    }
    this.logger.log('Seed data created: 6 products');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);
    await this.prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        roles: { set: ['USER', 'ADMIN'] },
      },
    });
    this.logger.log(
      'Admin user created: admin@example.com with password "admin"',
    );

    // Seed random orders
    const products = await this.prisma.product.findMany();
    if (!products.length) {
      this.logger.log('No products found; skipping random orders seeding.');
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
      const randomOrderDate = this.randomDate(startDateRange, now);
      await this.prisma.order.create({
        data: {
          customerName,
          status,
          orderDate: randomOrderDate,
          orderItems: { create: orderItemsData },
        },
      });
    }
    this.logger.log(
      'Seed data created: 5 random orders with varied order dates',
    );
  }

  async onModuleInit() {
    await this.seed();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
