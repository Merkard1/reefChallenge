/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock the entire bcryptjs module so that its methods can be controlled.
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore mocks so they do not persist across tests.
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('should throw BadRequestException if email is already taken', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
      await expect(
        authService.register(
          'Alice',
          'Wonderland',
          'alice@example.com',
          'password',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
      });
    });

    it('should register a new non-admin user and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const createdUser = {
        id: 1,
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice@example.com',
        password: 'hashedPassword',
        roles: ['USER'],
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      mockJwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.register(
        'Alice',
        'Wonderland',
        'alice@example.com',
        'password',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Alice',
          lastName: 'Wonderland',
          email: 'alice@example.com',
          password: 'hashedPassword',
          roles: { set: ['USER'] },
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: createdUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should register a new admin user and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const createdUser = {
        id: 2,
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@example.com',
        password: 'hashedPassword',
        roles: ['USER', 'ADMIN'],
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      mockJwtService.sign
        .mockReturnValueOnce('adminAccessToken')
        .mockReturnValueOnce('adminRefreshToken');

      const result = await authService.register(
        'Bob',
        'Builder',
        'bob@example.com',
        'password',
        true,
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'bob@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Bob',
          lastName: 'Builder',
          email: 'bob@example.com',
          password: 'hashedPassword',
          roles: { set: ['USER', 'ADMIN'] },
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: createdUser,
        accessToken: 'adminAccessToken',
        refreshToken: 'adminRefreshToken',
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        authService.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const fakeUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedPassword',
        roles: ['USER'],
      };
      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('user@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
    });

    it('should login user and return tokens if credentials are valid', async () => {
      const fakeUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedPassword',
        roles: ['USER'],
      };
      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.login(
        'user@example.com',
        'correctPassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correctPassword',
        'hashedPassword',
      );
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: fakeUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token verification fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(authService.refreshToken('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found during refresh', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.refreshToken('someValidToken')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should refresh tokens and return new tokens if refresh token is valid', async () => {
      const fakeUser = { id: 1, email: 'user@example.com', roles: ['USER'] };
      mockJwtService.verify.mockReturnValue({ sub: fakeUser.id });
      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);
      mockJwtService.sign
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');

      const result = await authService.refreshToken('validRefreshToken');

      expect(mockJwtService.verify).toHaveBeenCalledWith('validRefreshToken', {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecretKey',
      });
      expect(result).toEqual({
        user: fakeUser,
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const fakeUser = { id: 1, email: 'user@example.com', roles: ['USER'] };
      mockJwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = authService.generateTokens(fakeUser);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });
});
