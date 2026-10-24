import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryService (Unit)', () => {
    let service: InventoryService;
    let prismaService: any;
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
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            transaction: {
                create: jest.fn(),
            },
        };

        prismaService = {
            $transaction: jest.fn().mockImplementation((cb) => cb(txMock)),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                { provide: PrismaService, useValue: prismaService },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
    });

    describe('purchase()', () => {
        it('should decrement vehicle quantity and record PURCHASE transaction atomically', async () => {
            txMock.vehicle.findUnique.mockResolvedValue(mockVehicle);
            txMock.vehicle.update.mockResolvedValue({ ...mockVehicle, quantity: 2 });
            txMock.transaction.create.mockResolvedValue({
                id: 'tx-1',
                type: 'PURCHASE',
                quantity: 1,
                vehicleId: mockVehicle.id,
                userId: mockUser.id,
            });

            const result = await service.purchase(mockVehicle.id, mockUser.id, { quantity: 1 });

            expect(txMock.vehicle.findUnique).toHaveBeenCalledWith({
                where: { id: mockVehicle.id },
            });
            expect(txMock.vehicle.update).toHaveBeenCalledWith({
                where: { id: mockVehicle.id },
                data: { quantity: { decrement: 1 } },
            });
            expect(txMock.transaction.create).toHaveBeenCalledWith({
                data: {
                    type: 'PURCHASE',
                    quantity: 1,
                    vehicleId: mockVehicle.id,
                    userId: mockUser.id,
                },
            });
            expect(result.vehicle.quantity).toBe(2);
            expect(result.transaction.type).toBe('PURCHASE');
        });

        it('should throw NotFoundException if vehicle does not exist', async () => {
            txMock.vehicle.findUnique.mockResolvedValue(null);

            await expect(
                service.purchase('non-existent', mockUser.id, { quantity: 1 }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if requested quantity exceeds in-stock quantity', async () => {
            txMock.vehicle.findUnique.mockResolvedValue({ ...mockVehicle, quantity: 0 }); // Out of stock

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

            expect(txMock.vehicle.findUnique).toHaveBeenCalledWith({
                where: { id: mockVehicle.id },
            });
            expect(txMock.vehicle.update).toHaveBeenCalledWith({
                where: { id: mockVehicle.id },
                data: { quantity: { increment: 5 } },
            });
            expect(txMock.transaction.create).toHaveBeenCalledWith({
                data: {
                    type: 'RESTOCK',
                    quantity: 5,
                    vehicleId: mockVehicle.id,
                    userId: mockUser.id,
                },
            });
            expect(result.vehicle.quantity).toBe(8);
            expect(result.transaction.type).toBe('RESTOCK');
        });

        it('should throw NotFoundException if vehicle to restock does not exist', async () => {
            txMock.vehicle.findUnique.mockResolvedValue(null);

            await expect(
                service.restock('non-existent', mockUser.id, { quantity: 5 }),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
