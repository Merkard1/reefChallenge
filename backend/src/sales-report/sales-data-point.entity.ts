import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SalesDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  totalSales: number;

  @Field(() => Int)
  ordersCount: number;
}
