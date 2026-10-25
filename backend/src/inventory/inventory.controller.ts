import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PurchaseDto } from './dto/purchase.dto';
import { RestockDto } from './dto/restock.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('api/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post(':id/reserve')
    async reserve(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.inventoryService.reserve(id, userId);
    }

    @Post(':id/release')
    async release(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.inventoryService.release(id, userId);
    }

    @Post(':id/purchase')
    async purchase(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: PurchaseDto,
    ) {
        return this.inventoryService.purchase(id, userId, dto);
    }

    @Post(':id/restock')
    @Roles(Role.ADMIN)
    async restock(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: RestockDto,
    ) {
        return this.inventoryService.restock(id, userId, dto);
    }
}
