import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const orders = await this.prisma.order.findMany({
      include: { orderItems: true },
    });

    let totalRevenue = 0;
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        totalRevenue += item.price * item.quantity;
      });
    });
    const ordersCount = orders.length;
    const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;
    const metrics = [
      { label: 'Total Revenue', value: totalRevenue },
      { label: 'Orders Count', value: ordersCount },
      { label: 'Avg Order Value', value: averageOrderValue },
    ];

    const revenueMap: Record<string, number> = {};
    orders.forEach((order) => {
      const dateKey = new Date(order.orderDate).toISOString().split('T')[0];
      let orderTotal = 0;
      order.orderItems.forEach((item) => {
        orderTotal += item.price * item.quantity;
      });
      revenueMap[dateKey] = (revenueMap[dateKey] || 0) + orderTotal;
    });
    const revenueOverTime = Object.entries(revenueMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const productSales: Record<number, number> = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        productSales[item.productId] =
          (productSales[item.productId] || 0) + item.price * item.quantity;
      });
    });
    const sortedProductSales = Object.entries(productSales)
      .map(([productId, sales]) => ({ productId: Number(productId), sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    const topProductSales = await Promise.all(
      sortedProductSales.map(async ({ productId, sales }) => {
        const product = await this.prisma.product.findUnique({
          where: { id: productId },
        });
        return {
          productName: product?.name || `Product ${productId}`,
          sales,
        };
      }),
    );

    return {
      metrics,
      revenueOverTime,
      topProductSales,
    };
  }
}
