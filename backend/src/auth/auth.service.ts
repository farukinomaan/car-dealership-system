import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // 1. Check for existing user
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email is already registered');
        }

        // 2. Hash password with bcrypt (salt rounds: 10)
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3. Persist user in database
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });

        // 4. Return user object without the password hash
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(dto: LoginDto) {
        // 1. Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Compare password hash
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Sign JWT access token with user claims
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);

        // 4. Return token and sanitized user profile
        const { password: _, ...userWithoutPassword } = user;
        return {
            accessToken,
            user: userWithoutPassword,
        };
    }
}
