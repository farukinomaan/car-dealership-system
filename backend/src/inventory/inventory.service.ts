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
     * TIER 1: BookMyShow 2-Minute Lock Reservation
     * Locks the car exclusively for this user in Redis for 120 seconds.
     */
    async reserve(vehicleId: string, userId: string) {
        const lockKey = `vehicle:hold:${vehicleId}`;
        const currentHolder = await this.redis.getHolder(lockKey);

        // If locked by another customer, send 409 for the IRCTC queue screen
        if (currentHolder && currentHolder !== userId) {
            throw new ConflictException(
                'This vehicle is currently locked in an active 2-minute booking window by another buyer.',
            );
        }

        // Acquire 2-minute hold (120 seconds TTL in Redis)
        const acquired = await this.redis.acquireHold(lockKey, userId, 120);
        if (!acquired && currentHolder !== userId) {
            throw new ConflictException(
                'This vehicle is currently locked in an active 2-minute booking window by another buyer.',
            );
        }

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
        const lockKey = `vehicle:hold:${vehicleId}`;
        await this.redis.releaseHold(lockKey, userId);
        return { status: 'RELEASED' };
    }

    /**
     * Finalize Purchase inside PostgreSQL ACID Transaction
     */
    async purchase(vehicleId: string, userId: string, dto: PurchaseDto) {
        const qty = dto.quantity || 1;
        const lockKey = `vehicle:hold:${vehicleId}`;

        // Verify the user holds the active reservation lock
        const currentHolder = await this.redis.getHolder(lockKey);
        if (currentHolder && currentHolder !== userId) {
            throw new ConflictException(
                'This vehicle is currently held in checkout by another customer. Please try again shortly.',
            );
        }

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
            // Clean up the Redis hold once purchase settles
            await this.redis.releaseHold(lockKey, userId);
        }
    }

    /**
     * Admin Restock Operation
     */
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
