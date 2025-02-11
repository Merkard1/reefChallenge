import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Query(() => User)
  async user(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(
    @Args('firstName', { type: () => String }) firstName: string,
    @Args('lastName', { type: () => String }) lastName: string,
    @Args('email', { type: () => String }) email: string,
    @Args('password', { type: () => String }) password: string,
    @Args('roles', { type: () => [String], defaultValue: ['ADMIN'] })
    roles: string[],
  ) {
    return this.userService.createUser(
      firstName,
      lastName,
      email,
      password,
      roles,
    );
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    // This can be nullable, so user can skip passing "roles"
    @Args('roles', { type: () => [String], nullable: true }) roles?: string[],
  ) {
    return this.userService.updateUser(id, roles);
  }

  @Mutation(() => User)
  async deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.deleteUser(id);
  }
}
