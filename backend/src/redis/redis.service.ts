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
     * Acquire a temporary hold/lock (BookMyShow style)
     * @param key Lock identifier (e.g., `lock:vehicle:${id}`)
     * @param userId The buyer holding the item
     * @param ttlSeconds Reservation window (e.g., 120s = 2 minutes)
     */
    async acquireHold(key: string, userId: string, ttlSeconds: number = 120): Promise<boolean> {
        try {
            // SET key value NX EX ttl (Only set if doesn't exist, expire in ttl seconds)
            const result = await this.client.set(key, userId, 'EX', ttlSeconds, 'NX');
            return result === 'OK';
        } catch {
            return true; // Graceful fallback if Redis is offline
        }
    }

    /**
     * Check who currently holds the item
     */
    async getHolder(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch {
            return null;
        }
    }

    /**
     * Release hold after purchase completes or user cancels
     */
    async releaseHold(key: string, userId: string): Promise<void> {
        try {
            // Only release if the current holder is the same user
            const currentHolder = await this.client.get(key);
            if (currentHolder === userId) {
                await this.client.del(key);
            }
        } catch (err) {
            this.logger.error(`Failed to release hold: ${err}`);
        }
    }

    onModuleDestroy() {
        this.client.disconnect();
    }
}
