import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';
import slugify from 'slugify';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true,unique:true, trim: true })
  name: string;

  @Prop({ unique: true, index: true })
  slug: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  parent: mongoose.Types.ObjectId | null;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  ])
  children: mongoose.Types.ObjectId[];

  @Prop([
    {
      _id: false,
      type: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        slug: String,
      },
    },
  ])
  ancestors: {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  }[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Auto-generate slug
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Build tree ancestors before saving
CategorySchema.pre('save', async function (next) {
  if (!this.parent) {
    this.ancestors = [];
    return next();
  }

  type ParentCategoryType = {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    ancestors: {
      _id: mongoose.Types.ObjectId;
      name: string;
      slug: string;
    }[];
  } | null;

  const parentCategory = await this.model('Category').findById(this.parent).select('name slug ancestors').lean<ParentCategoryType>();

  if (parentCategory) {
    this.ancestors = [
      ...(parentCategory.ancestors || []),
      { _id: parentCategory._id, name: parentCategory.name, slug: parentCategory.slug },
    ];
  }

  next();
});
