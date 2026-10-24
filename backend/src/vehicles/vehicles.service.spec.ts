import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VehiclesService (Unit)', () => {
    let service: VehiclesService;
    let prismaService: any;

    const mockVehicle = {
        id: 'veh-1234',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        category: 'Sedan',
        price: 26000.00,
        quantity: 5,
        imageUrl: 'https://example.com/camry.jpg',
        description: 'Reliable sedan',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        prismaService = {
            vehicle: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VehiclesService,
                { provide: PrismaService, useValue: prismaService },
            ],
        }).compile();

        service = module.get<VehiclesService>(VehiclesService);
    });

    describe('create()', () => {
        it('should create and return a vehicle', async () => {
            const createDto = {
                make: 'Toyota',
                model: 'Camry',
                year: 2024,
                category: 'Sedan',
                price: 26000.00,
                quantity: 5,
            };

            prismaService.vehicle.create.mockResolvedValue(mockVehicle);

            const result = await service.create(createDto);

            expect(prismaService.vehicle.create).toHaveBeenCalledWith({
                data: createDto,
            });
            expect(result).toEqual(mockVehicle);
        });
    });

    describe('findAll()', () => {
        it('should return an array of all vehicles ordered by createdAt desc', async () => {
            prismaService.vehicle.findMany.mockResolvedValue([mockVehicle]);

            const result = await service.findAll();

            expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual([mockVehicle]);
        });
    });

    describe('findOne()', () => {
        it('should return a vehicle if it exists', async () => {
            prismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);

            const result = await service.findOne('veh-1234');
            expect(result).toEqual(mockVehicle);
        });

        it('should throw NotFoundException if vehicle does not exist', async () => {
            prismaService.vehicle.findUnique.mockResolvedValue(null);

            await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('search()', () => {
        it('should apply make, model, category, and price range filters', async () => {
            prismaService.vehicle.findMany.mockResolvedValue([mockVehicle]);

            const filters = {
                make: 'Toyo',
                category: 'Sedan',
                minPrice: 20000,
                maxPrice: 30000,
            };

            const result = await service.search(filters);

            expect(prismaService.vehicle.findMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    make: { contains: 'Toyo', mode: 'insensitive' },
                    category: { equals: 'Sedan', mode: 'insensitive' },
                    price: { gte: 20000, lte: 30000 },
                }),
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual([mockVehicle]);
        });
    });

    describe('update()', () => {
        it('should update and return vehicle if found', async () => {
            prismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);
            prismaService.vehicle.update.mockResolvedValue({ ...mockVehicle, price: 27000 });

            const result = await service.update('veh-1234', { price: 27000 });

            expect(prismaService.vehicle.update).toHaveBeenCalledWith({
                where: { id: 'veh-1234' },
                data: { price: 27000 },
            });
            expect(result.price).toBe(27000);
        });

        it('should throw NotFoundException when updating non-existent vehicle', async () => {
            prismaService.vehicle.findUnique.mockResolvedValue(null);

            await expect(service.update('non-existent', { price: 27000 })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove()', () => {
        it('should delete vehicle if found', async () => {
            prismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);
            prismaService.vehicle.delete.mockResolvedValue(mockVehicle);

            const result = await service.remove('veh-1234');

            expect(prismaService.vehicle.delete).toHaveBeenCalledWith({
                where: { id: 'veh-1234' },
            });
            expect(result).toEqual({ message: 'Vehicle deleted successfully' });
        });

        it('should throw NotFoundException when deleting non-existent vehicle', async () => {
            prismaService.vehicle.findUnique.mockResolvedValue(null);

            await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
});
