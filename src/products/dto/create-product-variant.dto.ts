import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// Transform options from JSON string or object to Map-like structure
const normalizeOptions = (value: unknown): Record<string, string> => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      // If parsing fails, treat as invalid
    }
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, string>;
  }

  return {};
};

export class CreateProductVariantDto {
  @Transform(({ value }) => normalizeOptions(value))
  @IsObject()
  @IsNotEmpty()
  options: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}
