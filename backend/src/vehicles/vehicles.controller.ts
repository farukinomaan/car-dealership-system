import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    @Roles(Role.ADMIN)
    async create(@Body() dto: CreateVehicleDto) {
        return this.vehiclesService.create(dto);
    }

    @Get()
    async findAll() {
        return this.vehiclesService.findAll();
    }

    @Get('search')
    async search(@Query() filters: SearchVehicleDto) {
        return this.vehiclesService.search(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.vehiclesService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
        return this.vehiclesService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    async remove(@Param('id') id: string) {
        return this.vehiclesService.remove(id);
    }
}
