import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('InventoryService (Unit)', () => {
    let service: InventoryService;
    let prismaService: any;
    let redisService: any;
    let txMock: any;

    const mockVehicle = {
        id: 'veh-1234',
        make: 'Honda',
        model: 'Civic',
        quantity: 3,
    };

    const mockUser = {
        id: 'user-5678',
        email: 'buyer@example.com',
    };

    beforeEach(async () => {
        txMock = {
            vehicle: {
                findUnique: jest.fn().mockResolvedValue(mockVehicle),
                update: jest.fn(),
                updateMany: jest.fn(),
            },
            transaction: {
                create: jest.fn(),
            },
        };

        prismaService = {
            vehicle: {
                findUnique: jest.fn().mockResolvedValue(mockVehicle),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb(txMock)),
        };

        redisService = {
            acquireHold: jest.fn().mockResolvedValue(true),
            getActiveHoldsCount: jest.fn().mockResolvedValue(0),
            hasUserHold: jest.fn().mockResolvedValue(false),
            releaseHold: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                { provide: PrismaService, useValue: prismaService },
                { provide: RedisService, useValue: redisService },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
    });

    describe('reserve()', () => {
        it('should acquire hold if active reservations are less than in-stock quantity', async () => {
            redisService.getActiveHoldsCount.mockResolvedValue(1); // 1 held out of 3
            redisService.hasUserHold.mockResolvedValue(false);

            const result = await service.reserve(mockVehicle.id, mockUser.id);

            expect(result.status).toBe('RESERVED');
            expect(result.expiresInSeconds).toBe(120);
            expect(redisService.acquireHold).toHaveBeenCalledWith(
                mockVehicle.id,
                mockUser.id,
                120,
            );
        });

        it('should throw ConflictException if all in-stock units are currently reserved', async () => {
            redisService.getActiveHoldsCount.mockResolvedValue(3); // 3 held out of 3

            await expect(
                service.reserve(mockVehicle.id, mockUser.id),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('purchase()', () => {
        it('should atomically decrement stock and create PURCHASE audit transaction', async () => {
            txMock.vehicle.updateMany.mockResolvedValue({ count: 1 });
            txMock.vehicle.findUnique.mockResolvedValue({ ...mockVehicle, quantity: 2 });
            txMock.transaction.create.mockResolvedValue({
                id: 'tx-1',
                type: 'PURCHASE',
                quantity: 1,
                vehicleId: mockVehicle.id,
                userId: mockUser.id,
            });

            const result = await service.purchase(mockVehicle.id, mockUser.id, { quantity: 1 });

            expect(txMock.vehicle.updateMany).toHaveBeenCalledWith({
                where: { id: mockVehicle.id, quantity: { gte: 1 } },
                data: { quantity: { decrement: 1 } },
            });
            expect(result.vehicle?.quantity).toBe(2);
            expect(result.transaction.type).toBe('PURCHASE');
            expect(redisService.releaseHold).toHaveBeenCalledWith(mockVehicle.id, mockUser.id);
        });

        it('should throw NotFoundException if vehicle does not exist on stock failure', async () => {
            txMock.vehicle.updateMany.mockResolvedValue({ count: 0 });
            txMock.vehicle.findUnique.mockResolvedValue(null);

            await expect(
                service.purchase('non-existent', mockUser.id, { quantity: 1 }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if vehicle has insufficient stock', async () => {
            txMock.vehicle.updateMany.mockResolvedValue({ count: 0 });
            txMock.vehicle.findUnique.mockResolvedValue({ ...mockVehicle, quantity: 0 });

            await expect(
                service.purchase(mockVehicle.id, mockUser.id, { quantity: 1 }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('restock()', () => {
        it('should increment vehicle quantity and record RESTOCK transaction atomically', async () => {
            txMock.vehicle.findUnique.mockResolvedValue(mockVehicle);
            txMock.vehicle.update.mockResolvedValue({ ...mockVehicle, quantity: 8 });
            txMock.transaction.create.mockResolvedValue({
                id: 'tx-2',
                type: 'RESTOCK',
                quantity: 5,
                vehicleId: mockVehicle.id,
                userId: mockUser.id,
            });

            const result = await service.restock(mockVehicle.id, mockUser.id, { quantity: 5 });

            expect(txMock.vehicle.update).toHaveBeenCalledWith({
                where: { id: mockVehicle.id },
                data: { quantity: { increment: 5 } },
            });
            expect(result.vehicle?.quantity).toBe(8);
            expect(result.transaction.type).toBe('RESTOCK');
        });
    });
});
