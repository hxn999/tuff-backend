import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../schemas/order.schema';
import { VariantDto, CartProductDto } from 'src/user/dto/addToCart';

export class ProductItemDto {
  @IsNotEmpty()
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

export class CreateOrderDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  items: ProductItemDto[];



  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // Shipping Information
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  shippingName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumber('BD')
  shippingPhone: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumber('BD')
  shippingPhone2?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  shippingAddress: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shippingDistrict: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shippingCity: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingInstructions?: string;
}
