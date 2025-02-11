import { SalesReportService } from './sales-report.service';

describe('SalesReportService', () => {
  let salesReportService: SalesReportService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      order: {
        findMany: jest.fn(),
      },
    };

    salesReportService = new SalesReportService(prismaMock);
  });

  describe('getSalesReport', () => {
    it('should compute global metrics and dataPoints correctly', async () => {
      const order1 = {
        orderDate: new Date('2025-01-10T10:00:00Z'),
        orderItems: [{ price: 100, quantity: 2 }],
      };

      const order2 = {
        orderDate: new Date('2025-01-15T12:00:00Z'),
        orderItems: [{ price: 50, quantity: 3 }],
      };

      const order3 = {
        orderDate: new Date('2025-01-15T15:00:00Z'),
        orderItems: [{ price: 25, quantity: 4 }],
      };

      const mockOrders = [order1, order2, order3];
      prismaMock.order.findMany.mockResolvedValue(mockOrders);

      const report = await salesReportService.getSalesReport(
        '2025-01-01',
        '2025-01-31',
      );

      expect(report.totalSales).toBe(450);
      expect(report.ordersCount).toBe(3);
      expect(report.averageOrderValue).toBe(150);
      expect(report.dataPoints).toEqual([
        { date: '2025-01-10', totalSales: 200, ordersCount: 1 },
        { date: '2025-01-15', totalSales: 250, ordersCount: 2 },
      ]);

      expect(report.orders).toEqual(mockOrders);
    });
  });
});
