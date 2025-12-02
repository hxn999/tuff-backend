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
  IsMongoId,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../schemas/order.schema';

// ProductItemDto matches the ProductItem schema from user.schema.ts
// The items will come from the user's cart, which already has the correct structure
// Note: selectedOptions is stored as Map in schema but can be sent as object in DTO
export class ProductItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsMongoId()
  @IsNotEmpty()
  variantId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  // selectedOptions can be sent as object (will be converted to Map in service if needed)
  @IsOptional()
  @IsObject()
  selectedOptions?: Record<string, string>;
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
