import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class RevenueDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  revenue: number;
}
