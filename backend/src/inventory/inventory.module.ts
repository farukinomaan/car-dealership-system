import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { RedisService } from '../redis/redis.service';

@Module({
    controllers: [InventoryController],
    providers: [InventoryService, RedisService],
    exports: [InventoryService],
})
export class InventoryModule { }
