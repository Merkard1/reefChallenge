import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Injectable } from '@nestjs/common';

type ExtendedProduct = Omit<PrismaProduct, 'updatedAt'> & { updatedAt: Date };

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // Returns all products sorted by createdAt descending.
  async findAll(): Promise<ExtendedProduct[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' as Prisma.SortOrder },
    });
    return products.map((product) => ({
      ...product,
      updatedAt: (product as any).updatedAt ?? product.createdAt,
    }));
  }

  // Returns products filtered by search term and sorted by sortKey and order.
  async findFiltered(
    search?: string,
    sortKey?: string,
    order?: 'asc' | 'desc',
  ): Promise<ExtendedProduct[]> {
    const whereClause = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
          ],
        }
      : {};

    const validSortKeys = ['name', 'price', 'createdAt', 'updatedAt'];
    let orderByClause: { [key: string]: 'asc' | 'desc' } = {
      createdAt: 'desc',
    };

    if (sortKey && validSortKeys.includes(sortKey) && order) {
      orderByClause = { [sortKey]: order };
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });
    return products.map((product) => ({
      ...product,
      updatedAt: (product as any).updatedAt ?? product.createdAt,
    }));
  }

  // Creates a new product.
  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    image: string;
  }): Promise<ExtendedProduct> {
    const product = await this.prisma.product.create({ data });
    this.notificationsGateway.sendNotification('productCreated', product.name);
    return {
      ...product,
      updatedAt: (product as any).updatedAt ?? product.createdAt,
    };
  }

  // Updates an existing product.
  async updateProduct(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      image?: string;
    },
  ): Promise<ExtendedProduct> {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    return {
      ...product,
      updatedAt: (product as any).updatedAt ?? product.createdAt,
    };
  }

  // Deletes a product.
  async deleteProduct(id: number) {
    const product = await this.prisma.product.delete({ where: { id } });
    this.notificationsGateway.sendNotification('productDeleted', product.name);
    return product;
  }
}
