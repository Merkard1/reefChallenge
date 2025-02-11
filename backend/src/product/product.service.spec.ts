import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

type ExtendedProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('ProductService', () => {
  let productService: ProductService;
  let prismaService: PrismaService;
  let notificationsGateway: NotificationsGateway;

  const mockPrismaProductMethods = {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    product: mockPrismaProductMethods,
  };

  const mockNotificationsGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products sorted by createdAt descending', async () => {
      const mockProducts: ExtendedProduct[] = [
        {
          id: 1,
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          image: 'image1',
          createdAt: new Date('2022-01-01'),
          updatedAt: new Date('2022-01-01'),
        },
        {
          id: 2,
          name: 'Product 2',
          description: 'Description 2',
          price: 200,
          image: 'image2',
          createdAt: new Date('2022-02-01'),
          updatedAt: new Date('2022-02-01'),
        },
      ];

      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      const result = await productService.findAll();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(
        mockProducts.map((product) => ({
          ...product,
          updatedAt: product.updatedAt ?? product.createdAt,
        })),
      );
    });
  });

  describe('findFiltered', () => {
    it('should return filtered products when search term is provided', async () => {
      const search = 'Test';
      const mockProducts: ExtendedProduct[] = [
        {
          id: 1,
          name: 'Test Product',
          description: 'Description here',
          price: 150,
          image: 'image',
          createdAt: new Date('2022-03-01'),
          updatedAt: new Date('2022-03-01'),
        },
      ];
      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      const result = await productService.findFiltered(search, 'name', 'asc');

      expect(prismaService.product.findMany).toHaveBeenCalled();
      expect(result).toEqual(
        mockProducts.map((product) => ({
          ...product,
          updatedAt: product.updatedAt ?? product.createdAt,
        })),
      );
    });
  });

  describe('createProduct', () => {
    it('should create a new product and send notification', async () => {
      const data = {
        name: 'New Product',
        description: 'New description',
        price: 120,
        image: 'new-image',
      };

      const createdProduct: ExtendedProduct = {
        id: 3,
        ...data,
        createdAt: new Date(),
        updatedAt: null as any,
      };

      (prismaService.product.create as jest.Mock).mockResolvedValue(
        createdProduct,
      );

      const result = await productService.createProduct(data);

      expect(prismaService.product.create).toHaveBeenCalledWith({ data });
      expect(notificationsGateway.sendNotification).toHaveBeenCalledWith(
        'productCreated',
        createdProduct.name,
      );

      expect(result.updatedAt).toEqual(createdProduct.createdAt);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const id = 1;
      const updateData = { name: 'Updated Product' };
      const updatedProduct: ExtendedProduct = {
        id,
        name: 'Updated Product',
        description: 'Old description',
        price: 100,
        image: 'image1',
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-04-01'),
      };

      (prismaService.product.update as jest.Mock).mockResolvedValue(
        updatedProduct,
      );

      const result = await productService.updateProduct(id, updateData);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
      expect(result).toEqual({
        ...updatedProduct,
        updatedAt: updatedProduct.updatedAt ?? updatedProduct.createdAt,
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and send notification', async () => {
      const id = 1;
      const deletedProduct: ExtendedProduct = {
        id,
        name: 'Product to Delete',
        description: 'Description',
        price: 100,
        image: 'image1',
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
      };

      (prismaService.product.delete as jest.Mock).mockResolvedValue(
        deletedProduct,
      );

      const result = await productService.deleteProduct(id);

      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(notificationsGateway.sendNotification).toHaveBeenCalledWith(
        'productDeleted',
        deletedProduct.name,
      );
      expect(result).toEqual(deletedProduct);
    });
  });
});
