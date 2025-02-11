import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float, { nullable: true })
  price?: number;
}
