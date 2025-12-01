import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductItem } from 'src/user/schemas/user.schema';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  ONLINE_PAYMENT = 'online_payment',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_BANKING = 'mobile_banking',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, trim: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: [ProductItem], required: true })
  items: ProductItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number; // Total before discount

  @Prop({ default: 0, min: 0 })
  discountAmount: number; // Discount from coupon

  @Prop({ required: true, min: 0 })
  totalAmount: number; // Final amount after discount

  @Prop({ default: null })
  couponCode?: string;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: Types.ObjectId, ref: 'Payment', default: null })
  paymentId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  // Shipping Information
  @Prop({ required: true, trim: true })
  shippingName: string;

  @Prop({ required: true, trim: true })
  shippingPhone: string;

  @Prop({ trim: true })
  shippingPhone2?: string;

  @Prop({ required: true, trim: true })
  shippingAddress: string;

  @Prop({ required: true, trim: true })
  shippingDistrict: string;

  @Prop({ required: true, trim: true })
  shippingCity: string;

  @Prop({ trim: true })
  shippingInstructions?: string;

  // Order tracking
  @Prop({ trim: true })
  trackingNumber?: string;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Create indexes for better query performance
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ paymentId: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ couponCode: 1 });
