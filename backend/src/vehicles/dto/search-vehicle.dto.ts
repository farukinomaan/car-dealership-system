import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchVehicleDto {
    @IsString()
    @IsOptional()
    make?: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    minPrice?: number;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    @IsOptional()
    maxPrice?: number;
}
