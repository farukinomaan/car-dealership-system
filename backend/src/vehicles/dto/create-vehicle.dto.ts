import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty()
    make!: string;

    @IsString()
    @IsNotEmpty()
    model!: string;

    @IsNumber()
    @Type(() => Number)
    @Min(1900)
    year!: number;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Type(() => Number)
    @IsPositive({ message: 'Price must be greater than zero' })
    price!: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0, { message: 'Quantity cannot be negative' })
    quantity!: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
