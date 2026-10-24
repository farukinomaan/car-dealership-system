import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseDto {
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Must purchase at least 1 unit' })
    @Type(() => Number)
    @IsOptional()
    quantity: number = 1;
}

