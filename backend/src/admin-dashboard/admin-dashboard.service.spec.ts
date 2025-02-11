/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should return empty dashboard data when no orders exist', async () => {
      // When no orders are found, return an empty array.
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.getDashboardData();

      expect(result).toEqual({
        metrics: [
          { label: 'Total Revenue', value: 0 },
          { label: 'Orders Count', value: 0 },
          { label: 'Avg Order Value', value: 0 },
        ],
        revenueOverTime: [],
        topProductSales: [],
      });
    });

    it('should return correct dashboard data for existing orders', async () => {
      // Create two test orders with order items.
      const orders = [
        {
          id: 1,
          orderDate: new Date('2025-01-01T10:00:00Z'),
          orderItems: [
            { productId: 1, price: 100, quantity: 2 }, // Revenue: 200
            { productId: 2, price: 50, quantity: 1 }, // Revenue: 50  -> Order1 Total: 250
          ],
        },
        {
          id: 2,
          orderDate: new Date('2025-01-02T12:00:00Z'),
          orderItems: [
            { productId: 1, price: 100, quantity: 1 }, // Revenue: 100
            { productId: 3, price: 200, quantity: 1 }, // Revenue: 200 -> Order2 Total: 300
          ],
        },
      ];
      // Mock orders retrieval.
      mockPrismaService.order.findMany.mockResolvedValue(orders);

      // Set up the product.findUnique mock.
      // Calculate expected product sales:
      // - Product 1: (100*2) + (100*1) = 300
      // - Product 2: (50*1) = 50
      // - Product 3: (200*1) = 200
      // Sorted descending: product 1 (300), product 3 (200), product 2 (50)
      // For product 1 and 3, we return product objects; for product 2, we simulate not found.
      mockPrismaService.product.findUnique.mockImplementation(
        ({ where: { id } }) => {
          if (id === 1) {
            return Promise.resolve({ id: 1, name: 'Product One' });
          }
          if (id === 3) {
            return Promise.resolve({ id: 3, name: 'Product Three' });
          }
          // For product 2, simulate not found so the fallback name is used.
          return Promise.resolve(null);
        },
      );

      const result = await service.getDashboardData();

      // Expected calculations:
      // Total Revenue: 250 (order1) + 300 (order2) = 550
      // Orders Count: 2
      // Average Order Value: 550 / 2 = 275
      const expectedMetrics = [
        { label: 'Total Revenue', value: 550 },
        { label: 'Orders Count', value: 2 },
        { label: 'Avg Order Value', value: 275 },
      ];

      // Revenue over time should group by date (YYYY-MM-DD) and be sorted in ascending order.
      const expectedRevenueOverTime = [
        { date: '2025-01-01', revenue: 250 },
        { date: '2025-01-02', revenue: 300 },
      ];

      // Expected top product sales based on descending sales:
      // Product 1: 300, Product 3: 200, Product 2: 50.
      // The service returns a product name if found, otherwise falls back to "Product {id}".
      const expectedTopProductSales = [
        { productName: 'Product One', sales: 300 },
        { productName: 'Product Three', sales: 200 },
        { productName: 'Product 2', sales: 50 },
      ];

      expect(result.metrics).toEqual(expectedMetrics);
      expect(result.revenueOverTime).toEqual(expectedRevenueOverTime);
      expect(result.topProductSales).toEqual(expectedTopProductSales);
    });
  });
});
