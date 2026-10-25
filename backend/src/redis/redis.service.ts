// backend/src/redis/redis.service.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor() {
        const redisUrl = process.env.REDIS_URL;
        this.client = redisUrl
            ? new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true })
            : new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
                maxRetriesPerRequest: 1,
                lazyConnect: true,
            });

        this.client.connect().catch((err) => {
            this.logger.warn(`Redis not available (${err.message}). Falling back to DB-only.`);
        });
    }

    /**
     * Count how many distinct buyers currently hold a reservation for this vehicle
     */
    async getActiveHoldsCount(vehicleId: string): Promise<number> {
        try {
            const keys = await this.client.keys(`vehicle:hold:${vehicleId}:*`);
            return keys.length;
        } catch {
            return 0;
        }
    }

    /**
     * Check if a specific user already holds an active slot
     */
    async hasUserHold(vehicleId: string, userId: string): Promise<boolean> {
        try {
            const val = await this.client.get(`vehicle:hold:${vehicleId}:${userId}`);
            return Boolean(val);
        } catch {
            return false;
        }
    }

    /**
     * Acquire an individual 2-minute reservation lease for a buyer
     */
    async acquireHold(vehicleId: string, userId: string, ttlSeconds: number = 120): Promise<boolean> {
        try {
            const key = `vehicle:hold:${vehicleId}:${userId}`;
            const result = await this.client.set(key, 'HELD', 'EX', ttlSeconds, 'NX');
            return result === 'OK';
        } catch {
            return true;
        }
    }

    /**
     * Release this specific buyer's hold
     */
    async releaseHold(vehicleId: string, userId: string): Promise<void> {
        try {
            await this.client.del(`vehicle:hold:${vehicleId}:${userId}`);
        } catch (err) {
            this.logger.error(`Failed to release hold: ${err}`);
        }
    }

    onModuleDestroy() {
        this.client.disconnect();
    }
}
