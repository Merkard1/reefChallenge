import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Order } from '../order/order.entity';
import { SalesDataPoint } from './sales-data-point.entity';

@ObjectType()
export class SalesReport {
  @Field(() => Float)
  totalSales: number;

  @Field(() => Int)
  ordersCount: number;

  @Field(() => Float)
  averageOrderValue: number;

  @Field(() => [Order])
  orders: Order[];

  @Field(() => [SalesDataPoint])
  dataPoints: SalesDataPoint[];
}
