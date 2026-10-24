import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';

@Injectable()
export class VehiclesService {
    async create(dto: CreateVehicleDto): Promise<any> {
        throw new NotImplementedException();
    }

    async findAll(): Promise<any> {
        throw new NotImplementedException();
    }

    async findOne(id: string): Promise<any> {
        throw new NotImplementedException();
    }

    async search(filters: SearchVehicleDto): Promise<any> {
        throw new NotImplementedException();
    }

    async update(id: string, dto: UpdateVehicleDto): Promise<any> {
        throw new NotImplementedException();
    }

    async remove(id: string): Promise<any> {
        throw new NotImplementedException();
    }
}
