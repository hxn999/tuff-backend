import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../userRolesEnum';
import { Variant } from 'src/products/schemas/product.schema';

export type UserDocument = HydratedDocument<User>;

export class CartProduct {
  @Prop({ required: true, trim: true })
  _id: string;
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;
  @Prop({ required: true })
  images_url: string; // url of top image
  @Prop({ required: true, min: 0 })
  price: number;
  @Prop({ type: [Variant], default: [] })
  options: Variant[];
  @Prop({ required: true, unique: true, trim: true })
  public_url: string;
  @Prop({ required: true, min: 0, default: 0 })
  stock: number;
}

@Schema({ timestamps: true })
export class ProductItem {
  @Prop({ type: Number, default: 1, required: true })
  quantity: number;

  @Prop({ type: Variant, required: true })
  variant: Variant;

  @Prop({ type: CartProduct, required: true })
  product: CartProduct;
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

  @Prop({ type: [ProductItem], default: [] })
  wishlist: ProductItem[];

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
