import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';

@ObjectType()
export class AuthPayload {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
