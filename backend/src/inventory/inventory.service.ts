import { Injectable, NotImplementedException } from '@nestjs/common';
import { PurchaseDto } from './dto/purchase.dto';
import { RestockDto } from './dto/restock.dto';

@Injectable()
export class InventoryService {
    async purchase(vehicleId: string, userId: string, dto: PurchaseDto): Promise<any> {
        throw new NotImplementedException();
    }

    async restock(vehicleId: string, userId: string, dto: RestockDto): Promise<any> {
        throw new NotImplementedException();
    }
}
