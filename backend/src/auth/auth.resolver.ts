import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './auth.entity';
import { UnauthorizedException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('firstName') firstName: string,
    @Args('lastName') lastName: string,
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: any,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.register(
      firstName,
      lastName,
      email,
      password,
    );

    context.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user, accessToken, refreshToken };
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: any,
  ): Promise<AuthPayload> {
    const { user, accessToken, refreshToken } = await this.authService.login(
      email,
      password,
    );

    context.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      // secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user, accessToken, refreshToken };
  }

  @Mutation(() => AuthPayload)
  async refresh(@Args('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: any) {
    context.res.clearCookie('refreshToken');
    return true;
  }
}
