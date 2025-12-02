import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;
export type ProductVariantDocument = HydratedDocument<ProductVariant>;

@Schema({ timestamps: true })
export class ProductVariant {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({
    type: Map,
    of: String,
    required: true,
  })
  options: Map<string, string>;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  stock: number;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true })
  images_url: string[];

  @Prop({ required: true, default: 0 })
  top_image_index: number;

  @Prop()
  hover_image_index: number;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  category: mongoose.Types.ObjectId;

  // @Prop({ type: [Variant], default: [] })
  // options: Variant[];

  @Prop([
    {
      _id: false,
      name: String,
      values: [String],
    },
  ])
  options: {
    name: string; // e.g. "Color"
    values: string[]; // e.g. ["Red", "Blue"]
  }[];

  //stores the minimum price
  @Prop({ required: true, min: 0 })
  base_price: number;

  // @Prop({ required: true, unique: true, trim: true, uppercase: true })
  // sku: string;
  @Prop({ required: true, unique: true, trim: true })
  slug: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Create indexes for better query performance
ProductSchema.index({ title: 'text', description: 'text' }); // Text search
ProductSchema.index({ tags: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ slug: 1 }); // Unique slug for lookups
ProductSchema.index({ base_price: 1 }); // Price filtering
