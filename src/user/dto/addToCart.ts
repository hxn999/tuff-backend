import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}

export class CartProductDto {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  images_url: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  options: VariantDto[];

  @IsNotEmpty()
  @IsString()
  public_url: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;
}

export class AddToCartDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VariantDto)
  variant: VariantDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CartProductDto)
  product: CartProductDto;
}
