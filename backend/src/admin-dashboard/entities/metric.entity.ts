import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Metric {
  @Field()
  label: string;

  @Field(() => Float)
  value: number;
}
