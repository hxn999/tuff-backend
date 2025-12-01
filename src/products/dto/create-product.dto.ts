import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const parseJsonArray = (value: unknown) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value;
    }
  }

  return value;
};

const normalizeOptions = (value: unknown) => {
  const parsed = parseJsonArray(value);

  if (!Array.isArray(parsed)) {
    return parsed;
  }

  return parsed.map((option) => {
    if (typeof option !== 'object' || option === null) {
      return option;
    }

    const normalized = { ...option } as Record<string, unknown>;

    if (normalized.price !== undefined && normalized.price !== null) {
      const numericPrice = Number(normalized.price);
      normalized.price = Number.isNaN(numericPrice)
        ? normalized.price
        : numericPrice;
    }

    return normalized;
  });
};

class OptionDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @Transform(({ value }) => parseJsonArray(value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Transform(({ value }) => parseJsonArray(value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  category?: string[];

  @Transform(({ value }) => normalizeOptions(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];

  // stores the minimum/base price
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  lastingTime: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  smellProjection: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;
}
