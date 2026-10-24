import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseDto } from './dto/purchase.dto';
import { RestockDto } from './dto/restock.dto';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) { }

    async purchase(vehicleId: string, userId: string, dto: PurchaseDto) {
        const qty = dto.quantity || 1;

        // Execute atomically inside an ACID transaction to prevent race conditions
        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch current vehicle stock
            const vehicle = await tx.vehicle.findUnique({
                where: { id: vehicleId },
            });

            if (!vehicle) {
                throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }

            // 2. Validate stock availability
            if (vehicle.quantity < qty) {
                throw new BadRequestException(
                    `Insufficient stock. Available: ${vehicle.quantity}, Requested: ${qty}`,
                );
            }

            // 3. Decrement vehicle stock
            const updatedVehicle = await tx.vehicle.update({
                where: { id: vehicleId },
                data: { quantity: { decrement: qty } },
            });

            // 4. Create immutable transaction audit log
            const transaction = await tx.transaction.create({
                data: {
                    type: 'PURCHASE',
                    quantity: qty,
                    vehicleId,
                    userId,
                },
            });

            return {
                message: 'Vehicle purchased successfully',
                vehicle: updatedVehicle,
                transaction,
            };
        });
    }

    async restock(vehicleId: string, userId: string, dto: RestockDto) {
        const qty = dto.quantity;

        // Execute atomically inside an ACID transaction
        return this.prisma.$transaction(async (tx) => {
            // 1. Verify vehicle exists
            const vehicle = await tx.vehicle.findUnique({
                where: { id: vehicleId },
            });

            if (!vehicle) {
                throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }

            // 2. Increment stock
            const updatedVehicle = await tx.vehicle.update({
                where: { id: vehicleId },
                data: { quantity: { increment: qty } },
            });

            // 3. Create immutable transaction audit log
            const transaction = await tx.transaction.create({
                data: {
                    type: 'RESTOCK',
                    quantity: qty,
                    vehicleId,
                    userId,
                },
            });

            return {
                message: 'Vehicle restocked successfully',
                vehicle: updatedVehicle,
                transaction,
            };
        });
    }
}
