import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    isAdmin = false,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email is already taken');

    const hashed = await bcrypt.hash(password, 10);

    const roles = isAdmin ? ['USER', 'ADMIN'] : ['USER'];

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashed,
        roles: { set: roles },
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(user);
    return { user, accessToken, refreshToken };
  }

  // LOGIN
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = this.generateTokens(user);
    return { user, accessToken, refreshToken };
  }

  // REFRESH
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecretKey',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User no longer exists');

      const { accessToken, refreshToken: newRefresh } =
        this.generateTokens(user);
      return { user, accessToken, refreshToken: newRefresh };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secretKey',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecretKey',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
