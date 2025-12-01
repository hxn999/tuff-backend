import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryProductsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  // comma separated values accepted for tags and category
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsOptional()
  category?: string[];

  // price filtering
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
