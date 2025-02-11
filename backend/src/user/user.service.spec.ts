import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users sorted by id ascending', async () => {
      const users = [
        { id: 1, firstName: 'Alice', lastName: 'Wonderland' },
        { id: 2, firstName: 'Bob', lastName: 'Builder' },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await userService.findAll();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, firstName: 'Alice', lastName: 'Wonderland' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await userService.findOne(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(userService.findOne(999)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const createUserInput = {
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice@example.com',
        password: 'secret',
        roles: ['USER'],
      };

      const createdUser = { id: 1, ...createUserInput };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await userService.createUser(
        createUserInput.firstName,
        createUserInput.lastName,
        createUserInput.email,
        createUserInput.password,
        createUserInput.roles,
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: createUserInput.firstName,
          lastName: createUserInput.lastName,
          email: createUserInput.email,
          password: createUserInput.password,
          roles: { set: createUserInput.roles },
        },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user when roles are provided', async () => {
      const updatedUser = {
        id: 1,
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice@example.com',
        roles: ['USER', 'ADMIN'],
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, ['USER', 'ADMIN']);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { roles: { set: ['USER', 'ADMIN'] } },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update a user when roles are not provided', async () => {
      const updatedUser = {
        id: 1,
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice@example.com',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return the deleted user', async () => {
      const deletedUser = { id: 1, firstName: 'Alice', lastName: 'Wonderland' };
      mockPrismaService.user.delete.mockResolvedValue(deletedUser);

      const result = await userService.deleteUser(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(deletedUser);
    });
  });
});
