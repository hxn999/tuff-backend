import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  total_amount: number;

  @Prop({ required: true, default: 'BDT' })
  currency: string;

  @Prop({ required: true, unique: true })
  tran_id: string;

  @Prop()
  session_key?: string;

  @Prop({ type: String, enum: ['pending', 'failed', 'success'], default: 'pending' })
  status: string;

//   @Prop({ required: true })
//   success_url: string;

//   @Prop({ required: true })
//   fail_url: string;

//   @Prop({ required: true })
//   cancel_url: string;

//   @Prop({ required: true })
//   ipn_url: string;

  @Prop({ required: true })
  shipping_method: string;

  @Prop({ required: true })
  product_name: string;

  @Prop({ required: true })
  product_category: string;

  @Prop({ required: true })
  product_profile: string;

  // Customer Info
  @Prop({ required: true })
  cus_name: string;

  @Prop({ required: true })
  cus_email: string;

  @Prop({ required: true })
  cus_add1: string;

  @Prop()
  cus_add2?: string;

  @Prop({ required: true })
  cus_city: string;

  @Prop({ required: true })
  cus_state: string;

  @Prop({ required: true })
  cus_postcode: string;

  @Prop({ required: true })
  cus_country: string;

  @Prop({ required: true })
  cus_phone: string;

  @Prop()
  cus_fax?: string;

  // Shipping Info
  @Prop({ required: true })
  ship_name: string;

  @Prop({ required: true })
  ship_add1: string;

  @Prop()
  ship_add2?: string;

  @Prop({ required: true })
  ship_city: string;

  @Prop({ required: true })
  ship_state: string;

  @Prop({ required: true })
  ship_postcode: number;

  @Prop({ required: true })
  ship_country: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
