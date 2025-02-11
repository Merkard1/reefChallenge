import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Product)
@UseGuards(GqlAuthGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Query(() => [Product])
  async productsFiltered(
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('sortKey', { type: () => String, nullable: true }) sortKey?: string,
    @Args('order', { type: () => String, nullable: true })
    order?: 'asc' | 'desc',
  ): Promise<Product[]> {
    return this.productService.findFiltered(search, sortKey, order);
  }

  @Mutation(() => Product)
  async createProduct(
    @Args('name') name: string,
    @Args('description') description: string,
    @Args('price', { type: () => Float }) price: number,
    @Args('image') image: string,
  ): Promise<Product> {
    return this.productService.createProduct({
      name,
      description,
      price,
      image,
    });
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('price', { type: () => Float, nullable: true }) price?: number,
    @Args('image', { nullable: true }) image?: string,
  ): Promise<Product> {
    return this.productService.updateProduct(id, {
      name,
      description,
      price,
      image,
    });
  }

  @Mutation(() => Boolean)
  async deleteProduct(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const deletedProduct = await this.productService.deleteProduct(id);
    return !!deletedProduct;
  }
}
