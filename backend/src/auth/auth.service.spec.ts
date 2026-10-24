import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit)', () => {
    let service: AuthService;
    let prismaService: any;
    let jwtService: any;

    const mockUser = {
        id: 'uuid-1234',
        email: 'test@dealership.com',
        password: '$2b$10$hashedPasswordValue',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        prismaService = {
            user: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
        };

        jwtService = {
            signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prismaService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('register()', () => {
        const registerDto = {
            email: 'test@dealership.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Doe',
        };

        it('should throw ConflictException if email is already taken', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
        });

        it('should hash password and create user successfully', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);
            prismaService.user.create.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-secret') as any);

            const result = await service.register(registerDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    email: registerDto.email,
                    password: 'hashed-secret',
                    firstName: registerDto.firstName,
                    lastName: registerDto.lastName,
                }),
            });
            // Ensure the returned object strips the password field
            expect(result).not.toHaveProperty('password');
            expect(result.email).toBe(mockUser.email);
        });
    });

    describe('login()', () => {
        const loginDto = {
            email: 'test@dealership.com',
            password: 'password123',
        };

        it('should throw UnauthorizedException if user does not exist', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password does not match', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false) as any);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should return accessToken and user payload when credentials are valid', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true) as any);

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('accessToken', 'mock.jwt.token');
            expect(result.user).not.toHaveProperty('password');
            expect(result.user.email).toBe(mockUser.email);
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    sub: mockUser.id,
                    email: mockUser.email,
                    role: mockUser.role,
                }),
            );
        });
    });
});
