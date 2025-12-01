// src/coupon/schemas/coupon.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true, _id: false })
export class CouponUsage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  timesUsed: number;

  @Prop({ type: Date, default: Date.now })
  lastUsed: Date;
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string; // e.g., 'SUMMER25'

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number; // 25 (for 25%) or 100 (for fixed 100 BDT)

  @Prop({ default: 0, min: 0 })
  minOrderAmount: number; // coupon only applicable if cart >= this

  @Prop({ default: null, min: 0 })
  maxDiscountAmount?: number; // cap for percentage coupons

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  applicableProducts: Types.ObjectId[]; // empty = all products

  @Prop({ type: [String], default: [] })
  applicableCategories: string[]; // empty = all categories

  @Prop({ type: Number, default: 1 })
  usageLimit: number; // global usage limit

  @Prop({ type: Number, default: 1 })
  perUserLimit: number; // limit per user

  @Prop({ type: Number, default: 0 })
  usedCount: number; // incremented on successful order placement

  @Prop({ type: [CouponUsage], default: [] })
  usages: CouponUsage[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, required: true })
  validFrom: Date;

  @Prop({ type: Date, required: true })
  validUntil: Date;

  @Prop({ default: '' })
  note?: string; // admin note
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validUntil: 1 });
CouponSchema.index({ validFrom: 1 });
