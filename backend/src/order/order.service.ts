import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

interface CreateOrderItemInput {
  productId: number;
  quantity: number;
  price?: number;
}

interface CreateOrderInput {
  customerName: string;
  status: string;
  items: CreateOrderItemInput[];
}

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findAllFiltered(searchTerm?: string, status?: string) {
    const where: Prisma.OrderWhereInput = {};
    if (searchTerm) {
      where.customerName = { contains: searchTerm, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }
    return this.prisma.order.findMany({
      where,
      include: { orderItems: true },
      orderBy: { orderDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async createOrder({ customerName, status, items }: CreateOrderInput) {
    return this.prisma.order.create({
      data: {
        customerName,
        status,
        orderDate: new Date(),
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price ?? 0,
          })),
        },
      },
      include: { orderItems: true },
    });
  }

  async updateOrderStatus(id: number, newStatus: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: { orderItems: true },
    });
    this.notificationsGateway.sendNotification(
      'orderStatusChanged',
      `Order ${order.id} changed to ${newStatus}`,
    );
    return order;
  }

  async createRandomOrder() {
    // 1. Get all products
    const products = await this.prisma.product.findMany();
    if (!products.length) {
      throw new Error('No products available to create an order.');
    }

    // 2. Generate a random number (1 to 3) of order items.
    const numberOfItems = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    for (let i = 0; i < numberOfItems; i++) {
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1;
      orderItems.push({
        productId: randomProduct.id,
        quantity: randomQuantity,
        price: randomProduct.price,
      });
    }

    const customerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const statuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    const randomCustomerName =
      customerNames[Math.floor(Math.random() * customerNames.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return this.createOrder({
      customerName: randomCustomerName,
      status: randomStatus,
      items: orderItems,
    });
  }
}
