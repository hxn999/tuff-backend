import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../schemas/order.schema';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @IsOptional()
  @IsDateString()
  shippedAt?: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  // Shipping Information Updates
  @IsOptional()
  @IsString()
  @MaxLength(200)
  shippingName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumber('BD')
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumber('BD')
  shippingPhone2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingDistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingInstructions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}


