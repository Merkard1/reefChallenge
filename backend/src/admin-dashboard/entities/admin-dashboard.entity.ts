import { ObjectType, Field } from '@nestjs/graphql';
import { Metric } from './metric.entity';
import { RevenueDataPoint } from './revenue-data-point.entity';
import { ProductSalesDataPoint } from './product-sales-data-point.entity';

@ObjectType()
export class AdminDashboard {
  @Field(() => [Metric])
  metrics: Metric[];

  @Field(() => [RevenueDataPoint])
  revenueOverTime: RevenueDataPoint[];

  @Field(() => [ProductSalesDataPoint])
  topProductSales: ProductSalesDataPoint[];
}
