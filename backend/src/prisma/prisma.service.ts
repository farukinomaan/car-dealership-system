import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Utility helper for automated test suites to wipe tables between runs
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('cleanDatabase is not allowed in production');
        }
        // Delete in order to satisfy foreign key constraints
        await this.transaction.deleteMany();
        await this.vehicle.deleteMany();
        await this.user.deleteMany();
    }
}
