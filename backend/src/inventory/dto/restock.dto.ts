import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RestockDto {
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Restock quantity must be at least 1 unit' })
    @Type(() => Number)
    quantity!: number;
}
