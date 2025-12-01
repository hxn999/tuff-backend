import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../schemas/order.schema';

export class QueryOrdersDto {
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

  @IsString()
  @IsOptional()
  search?: string; // Search by orderId, shippingName, shippingPhone

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  userId?: string; // Filter by user ID

  @IsString()
  @IsOptional()
  couponCode?: string; // Filter by coupon code

  @IsDateString()
  @IsOptional()
  startDate?: string; // Filter orders from this date

  @IsDateString()
  @IsOptional()
  endDate?: string; // Filter orders until this date

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minAmount?: number; // Minimum total amount

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxAmount?: number; // Maximum total amount
}
