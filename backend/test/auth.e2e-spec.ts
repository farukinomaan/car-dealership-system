import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
        prisma = app.get<PrismaService>(PrismaService);
    });

    beforeEach(async () => {
        // Clean test database before each test to prevent test cross-contamination
        await prisma.cleanDatabase();
    });

    afterAll(async () => {
        await prisma.cleanDatabase();
        await app.close();
    });

    describe('POST /api/auth/register', () => {
        const validUser = {
            email: 'alex@example.com',
            password: 'password123',
            firstName: 'Alex',
            lastName: 'Smith',
        };

        it('should register a new user with status 201 and omit password', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe(validUser.email);
            expect(response.body.firstName).toBe(validUser.firstName);
            expect(response.body.lastName).toBe(validUser.lastName);
            expect(response.body.role).toBe('USER');
            expect(response.body).not.toHaveProperty('password');
        });

        it('should return 400 when email is invalid', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({ ...validUser, email: 'not-an-email' })
                .expect(400);
        });

        it('should return 409 when registering duplicate email', async () => {
            // First registration
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);

            // Duplicate registration attempt
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(validUser)
                .expect(409);

            expect(response.body.message).toContain('already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        const userCredentials = {
            email: 'sam@example.com',
            password: 'mypassword123',
            firstName: 'Sam',
            lastName: 'Altman',
        };

        beforeEach(async () => {
            // Register the user first
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(userCredentials);
        });

        it('should return 200 and an accessToken for valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: userCredentials.email,
                    password: userCredentials.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(userCredentials.email);
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should return 401 for incorrect password', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: userCredentials.email,
                    password: 'wrongpassword',
                })
                .expect(401);
        });
    });
});
