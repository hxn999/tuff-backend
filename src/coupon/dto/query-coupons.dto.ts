import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsBoolean, IsString } from 'class-validator';

export class QueryCouponsDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsString()
    @IsOptional()
    search?: string;
}
