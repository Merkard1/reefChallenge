import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

describe('OrderService', () => {
  let orderService: OrderService;
  let notificationsGateway: NotificationsGateway;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationsGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);

    jest.clearAllMocks();
  });

  describe('findAllFiltered', () => {
    it('should return orders with filters applied', async () => {
      const expectedOrders = [{ id: 1, customerName: 'Alice', orderItems: [] }];
      mockPrismaService.order.findMany.mockResolvedValue(expectedOrders);

      const result = await orderService.findAllFiltered('Ali', 'pending');

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          customerName: { contains: 'Ali', mode: 'insensitive' },
          status: 'pending',
        },
        include: { orderItems: true },
        orderBy: { orderDate: 'desc' },
      });
      expect(result).toEqual(expectedOrders);
    });

    it('should return orders without filters when none provided', async () => {
      const expectedOrders = [{ id: 2, customerName: 'Bob', orderItems: [] }];
      mockPrismaService.order.findMany.mockResolvedValue(expectedOrders);

      const result = await orderService.findAllFiltered();

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {},
        include: { orderItems: true },
        orderBy: { orderDate: 'desc' },
      });
      expect(result).toEqual(expectedOrders);
    });
  });

  describe('findOne', () => {
    it('should return the order if found', async () => {
      const expectedOrder = { id: 1, customerName: 'Alice', orderItems: [] };
      mockPrismaService.order.findUnique.mockResolvedValue(expectedOrder);

      const result = await orderService.findOne(1);

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { orderItems: true },
      });
      expect(result).toEqual(expectedOrder);
    });

    it('should throw NotFoundException if order is not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(orderService.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(orderService.findOne(999)).rejects.toThrow(
        'Order with ID 999 not found',
      );
    });
  });

  describe('createOrder', () => {
    it('should create an order with order items', async () => {
      const createOrderInput = {
        customerName: 'Charlie',
        status: 'processing',
        items: [
          { productId: 1, quantity: 2, price: 50 },
          { productId: 2, quantity: 1 },
        ],
      };

      const fakeOrder = {
        id: 123,
        customerName: 'Alice',
        status: 'pending',
        orderDate: new Date('2025-02-10T00:00:00Z'),
        orderItems: [
          { id: 1, orderId: 123, productId: 1, quantity: 2, price: 100 },
          { id: 2, orderId: 123, productId: 2, quantity: 3, price: 200 },
        ],
      };

      mockPrismaService.order.create.mockResolvedValue(fakeOrder);

      const result = await orderService.createOrder(createOrderInput);

      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          customerName: 'Charlie',
          status: 'processing',
          orderDate: expect.any(Date),
          orderItems: {
            create: [
              { productId: 1, quantity: 2, price: 50 },
              { productId: 2, quantity: 1, price: 0 },
            ],
          },
        },
        include: { orderItems: true },
      });
      expect(result).toEqual(fakeOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status and send a notification', async () => {
      const updatedOrder = {
        id: 1,
        customerName: 'Alice',
        status: 'shipped',
        orderItems: [],
      };
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus(1, 'shipped');

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'shipped' },
        include: { orderItems: true },
      });
      expect(notificationsGateway.sendNotification).toHaveBeenCalledWith(
        'orderStatusChanged',
        'Order 1 changed to shipped',
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('createRandomOrder', () => {
    it('should throw an error if no products are available', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(orderService.createRandomOrder()).rejects.toThrow(
        'No products available to create an order.',
      );
    });

    it('should create a random order with deterministic values', async () => {
      const products = [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const fakeOrder = {
        id: 123,
        customerName: 'Alice',
        status: 'pending',
        orderDate: new Date('2025-02-10T00:00:00Z'),
        orderItems: [
          { id: 1, orderId: 123, productId: 1, quantity: 2, price: 100 },
          { id: 2, orderId: 123, productId: 2, quantity: 3, price: 200 },
        ],
      };
      jest.spyOn(orderService, 'createOrder').mockResolvedValue(fakeOrder);

      const mathRandomMock = jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.0)
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.0)
        .mockReturnValueOnce(0.0);

      const result = await orderService.createRandomOrder();

      expect(orderService.createOrder).toHaveBeenCalledWith({
        customerName: 'Alice',
        status: 'pending',
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 3, price: 200 },
        ],
      });
      expect(result).toEqual(fakeOrder);

      mathRandomMock.mockRestore();
    });
  });
});
