import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class ProductSalesDataPoint {
  @Field()
  productName: string;

  @Field(() => Float)
  sales: number;
}
