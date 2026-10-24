import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateVehicleDto) {
        return this.prisma.vehicle.create({
            data: {
                make: dto.make,
                model: dto.model,
                year: dto.year,
                category: dto.category,
                price: dto.price,
                quantity: dto.quantity,
                imageUrl: dto.imageUrl,
                description: dto.description,
            },
        });
    }

    async findAll() {
        return this.prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
        });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }
        return vehicle;
    }

    async search(filters: SearchVehicleDto) {
        const where: Prisma.VehicleWhereInput = {};

        if (filters.make) {
            where.make = { contains: filters.make, mode: 'insensitive' };
        }
        if (filters.model) {
            where.model = { contains: filters.model, mode: 'insensitive' };
        }
        if (filters.category) {
            where.category = { equals: filters.category, mode: 'insensitive' };
        }
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.price = {
                ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
                ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
            };
        }

        return this.prisma.vehicle.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, dto: UpdateVehicleDto) {
        await this.findOne(id); // Ensures 404 is thrown if not found

        return this.prisma.vehicle.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensures 404 is thrown if not found

        await this.prisma.vehicle.delete({
            where: { id },
        });

        return { message: 'Vehicle deleted successfully' };
    }
}
