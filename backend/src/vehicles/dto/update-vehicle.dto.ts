import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVehicleDto {
    @IsString()
    @IsOptional()
    make?: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsNumber()
    @Type(() => Number)
    @Min(1900)
    @IsOptional()
    year?: number;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Type(() => Number)
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    quantity?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
