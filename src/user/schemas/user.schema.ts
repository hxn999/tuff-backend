import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../userRolesEnum';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true, id: false })
export class ProductItem {
  // Reference to Product
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  // Reference to ProductVariant
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  })
  variantId: mongoose.Types.ObjectId;

  // Quantity of this variant in cart
  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  // Snapshot data for quick display (avoids needing to populate on every fetch)
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true })
  image_url: string; // URL of the product's top image

  @Prop({ required: true, min: 0 })
  price: number; // Price at time of adding (for price protection)

  @Prop({ required: true, trim: true })
  slug: string; // Product slug for URL generation

  // Selected variant options as a Map for reference
  @Prop({
    type: Map,
    of: String,
    required: true,
  })
  selectedOptions: Map<string, string>; // e.g., { "Color": "Red", "Size": "Large" }

  @Prop({ required: true })
  sku: string; // Variant SKU for reference
}

@Schema({ timestamps: true })
export class User {
  @Prop({ trim: true })
  userId: string;
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  pfp: string;

  @Prop({
    required: false,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
  })
  email: string;

  @Prop({
    required: false,
    unique: true,
    sparse: true,
    trim: true,
  })
  phone: string;
  @Prop({ trim: true })
  phone2: string;

  @Prop({ required: true, trim: true })
  password: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  district: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  deliver_instructions: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    default: [],
  })
  orders: mongoose.Types.ObjectId[];
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
    default: [],
  })
  payments: mongoose.Types.ObjectId[];

  @Prop({ type: [ProductItem], default: [] })
  cart: ProductItem[];

  @Prop({ required: true, enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

// custom validation to ensure at least one contact method exists
UserSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    const error = new Error('Either email or phone must be provided');
    next(error);
  } else {
    next();
  }
});

UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.userId = this._id.toString();
  }
  next();
});
