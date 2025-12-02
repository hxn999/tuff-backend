import { Transform, Type } from 'class-transformer';
import {
  IsArray,
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
import { CreateProductVariantDto } from './create-product-variant.dto';

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

    // Ensure values is an array
    if (normalized.values !== undefined && normalized.values !== null) {
      if (typeof normalized.values === 'string') {
        try {
          normalized.values = JSON.parse(normalized.values);
        } catch {
          normalized.values = [normalized.values];
        }
      }
      if (!Array.isArray(normalized.values)) {
        normalized.values = [normalized.values];
      }
    }

    return normalized;
  });
};

class OptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  values: string[];
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

  @IsMongoId()
  @IsOptional()
  category?: string;

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
  base_price: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  top_image_index?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  hover_image_index?: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];
}
