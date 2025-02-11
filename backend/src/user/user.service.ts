import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    roles: string[],
  ) {
    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        roles: { set: roles },
      },
    });
  }

  async updateUser(id: number, roles?: string[]) {
    const data: any = {};
    if (roles !== undefined) {
      data.roles = { set: roles };
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
