import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  productId: number;
}

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field()
  customerName: string;

  @Field()
  orderDate: Date;

  @Field()
  status: string;

  @Field(() => [OrderItem])
  orderItems: OrderItem[];
}
