import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesReportService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch orders within the date range, including order items.
    const orders = await this.prisma.order.findMany({
      where: {
        orderDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        orderDate: 'asc',
      },
    });

    // Compute global sales data.
    let totalSales = 0;
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        totalSales += item.price * item.quantity;
      });
    });
    const ordersCount = orders.length;
    const averageOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

    // Group orders by day (YYYY-MM-DD) to compute daily totals.
    const dailyMap: Record<
      string,
      { totalSales: number; ordersCount: number }
    > = {};
    orders.forEach((order) => {
      const dateKey = order.orderDate.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { totalSales: 0, ordersCount: 0 };
      }
      let orderTotal = 0;
      order.orderItems.forEach((item) => {
        orderTotal += item.price * item.quantity;
      });
      dailyMap[dateKey].totalSales += orderTotal;
      dailyMap[dateKey].ordersCount += 1;
    });

    const dataPoints = Object.entries(dailyMap)
      .map(([date, values]) => ({
        date,
        totalSales: values.totalSales,
        ordersCount: values.ordersCount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalSales,
      ordersCount,
      averageOrderValue,
      orders,
      dataPoints,
    };
  }
}
