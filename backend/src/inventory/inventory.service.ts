// backend/src/inventory/inventory.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PurchaseDto } from './dto/purchase.dto';
import { RestockDto } from './dto/restock.dto';

@Injectable()
export class InventoryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    /**
     * TIER 1: Multi-Unit Reservation
     * Up to `vehicle.quantity` buyers can hold simultaneous 2-minute windows!
     */
    async reserve(vehicleId: string, userId: string) {
        // 1. Fetch available stock
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            select: { quantity: true, make: true, model: true },
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }

        if (vehicle.quantity <= 0) {
            throw new BadRequestException('This vehicle is completely sold out.');
        }

        // 2. If this user already holds a slot, let them continue their session
        const alreadyHeld = await this.redis.hasUserHold(vehicleId, userId);
        if (alreadyHeld) {
            return {
                status: 'RESERVED',
                expiresInSeconds: 120,
                expiresAt: Date.now() + 120 * 1000,
            };
        }

        // 3. Count how many other buyers are currently holding a unit
        const activeHoldsCount = await this.redis.getActiveHoldsCount(vehicleId);

        // 4. If all in-stock units are held, place user in Queue
        if (activeHoldsCount >= vehicle.quantity) {
            throw new ConflictException(
                `All ${vehicle.quantity} in-stock unit(s) are currently in active checkout sessions.`,
            );
        }

        // 5. Acquire 2-minute exclusive slot for this buyer
        await this.redis.acquireHold(vehicleId, userId, 120);

        return {
            status: 'RESERVED',
            expiresInSeconds: 120,
            expiresAt: Date.now() + 120 * 1000,
        };
    }

    /**
     * Release hold if user cancels or closes modal before 2 minutes
     */
    async release(vehicleId: string, userId: string) {
        await this.redis.releaseHold(vehicleId, userId);
        return { status: 'RELEASED' };
    }

    /**
     * Finalize Purchase inside PostgreSQL ACID Transaction
     */
    async purchase(vehicleId: string, userId: string, dto: PurchaseDto) {
        const qty = dto.quantity || 1;

        try {
            // TIER 2: Atomic Database Commit inside PostgreSQL ACID Transaction
            return await this.prisma.$transaction(async (tx) => {
                // Atomic conditional decrement: Only decrement if quantity >= qty
                const updateResult = await tx.vehicle.updateMany({
                    where: {
                        id: vehicleId,
                        quantity: { gte: qty },
                    },
                    data: {
                        quantity: { decrement: qty },
                    },
                });

                // If 0 rows updated, vehicle was either out of stock or does not exist
                if (updateResult.count === 0) {
                    const vehicle = await tx.vehicle.findUnique({
                        where: { id: vehicleId },
                    });

                    if (!vehicle) {
                        throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
                    }

                    throw new BadRequestException(
                        `Insufficient stock. Available: ${vehicle.quantity}, Requested: ${qty}`,
                    );
                }

                // Fetch the updated vehicle record
                const updatedVehicle = await tx.vehicle.findUnique({
                    where: { id: vehicleId },
                });

                // Create immutable transaction audit log
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
        } finally {
            // Clean up this buyer's Redis hold once purchase completes
            await this.redis.releaseHold(vehicleId, userId);
        }
    }

    /**
     * Admin Restock Operation
     */
    async restock(vehicleId: string, userId: string, dto: RestockDto) {
        const qty = dto.quantity;

        return this.prisma.$transaction(async (tx) => {
            const vehicle = await tx.vehicle.findUnique({
                where: { id: vehicleId },
            });

            if (!vehicle) {
                throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }

            const updatedVehicle = await tx.vehicle.update({
                where: { id: vehicleId },
                data: { quantity: { increment: qty } },
            });

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
