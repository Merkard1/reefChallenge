import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderItemInput } from './dto/order.dto';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  @Query(() => [Order])
  async orders(
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.orderService.findAllFiltered(searchTerm, status);
  }

  @Query(() => Order)
  async order(@Args('id', { type: () => Int }) id: number) {
    return this.orderService.findOne(id);
  }

  @Mutation(() => Order)
  async createOrder(
    @Args('customerName') customerName: string,
    @Args('status') status: string,
    @Args('items', { type: () => [OrderItemInput] }) items: OrderItemInput[],
  ) {
    return this.orderService.createOrder({ customerName, status, items });
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args('id', { type: () => Int }) id: number,
    @Args('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(id, status);
  }

  // New mutation to create a random order
  @Mutation(() => Order)
  async createRandomOrder() {
    return this.orderService.createRandomOrder();
  }
}
