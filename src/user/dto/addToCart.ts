import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsMongoId()
  @IsNotEmpty()
  variantId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;
}
