import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  Product,
  ProductDocument,
  ProductVariant,
  ProductVariantDocument,
} from './schemas/product.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { generateSlug } from 'src/lib/util/slugGenerator';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    images: Array<Express.Multer.File>,
    createDto: CreateProductDto,
  ): Promise<any> {
    console.log('product creating ...');
    console.log(createDto);

    const uploadedImagesResult =
      await this.cloudinaryService.uploadMultiple(images);
    let images_url: string[] = [];
    uploadedImagesResult.forEach((result) => {
      images_url.push(result.secure_url);
    });

    // Generate unique slug
    let baseSlug = generateSlug(createDto.title);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists and make it unique
    while (await this.productModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate image indices
    const topImageIndex = createDto.top_image_index ?? 0;
    const hoverImageIndex = createDto.hover_image_index;

    // Ensure indices are within bounds
    if (topImageIndex >= images_url.length) {
      throw new Error(
        `top_image_index (${topImageIndex}) is out of bounds. Only ${images_url.length} images uploaded.`,
      );
    }

    if (hoverImageIndex !== undefined && hoverImageIndex >= images_url.length) {
      throw new Error(
        `hover_image_index (${hoverImageIndex}) is out of bounds. Only ${images_url.length} images uploaded.`,
      );
    }

    const created = await this.productModel.create({
      title: createDto.title,
      description: createDto.description,
      tags: createDto.tags || [],
      category: createDto.category
        ? new Types.ObjectId(createDto.category)
        : undefined,
      options: createDto.options || [],
      base_price: createDto.base_price,
      images_url,
      top_image_index: topImageIndex,
      hover_image_index: hoverImageIndex,
      slug,
    });

    console.log(created);

    // Save product variants if provided
    if (createDto.variants && createDto.variants.length > 0) {
      const variantsToInsert = createDto.variants.map((variant) => ({
        productId: created._id,
        options: new Map<string, string>(Object.entries(variant.options)),
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock ?? 0,
      }));

      await this.productVariantModel.insertMany(variantsToInsert);
    }

    return {
      message: 'Product uploaded successfully !',
      product: created,
    };
  }

  async findAll(queryDto: QueryProductsDto) {
    const {
      page = 1,
      limit = 10,
      tags,
      category,
      minPrice,
      maxPrice,
      search,
    } = queryDto;

    const filter: FilterQuery<ProductDocument> = {};

    // Text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }
    if (category && category.length > 0) {
      filter.category = { $in: category };
    }
    if (minPrice != null || maxPrice != null) {
      filter.base_price = {} as any;
      if (minPrice != null) (filter.base_price as any).$gte = minPrice;
      if (maxPrice != null) (filter.base_price as any).$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const hasSearch = search && search.trim();

    // Build query with text score if searching
    const baseQuery = this.productModel.find(filter);
    const queryWithSelect = hasSearch
      ? baseQuery.select({ score: { $meta: 'textScore' } })
      : baseQuery;

    const sortOptions: any = hasSearch
      ? { score: { $meta: 'textScore' }, createdAt: -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      queryWithSelect
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .select(
          'title base_price images_url top_image_index hover_image_index slug',
        )
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    let product;
    if (!Types.ObjectId.isValid(id)) {
      product = await this.productModel.findOne({ slug: id }).populate('category').lean();
    } else {
      product = await this.productModel.findById(id).populate('category').lean();
    }

    if (!product) throw new NotFoundException('Product not found');

    // Fetch all variants for this product
    const variants = await this.productVariantModel
      .find({ productId: product._id })
      .lean();

    // Convert Map to object for JSON serialization
    // When using .lean(), Mongoose Maps are already converted to objects
    const variantsWithOptions = variants.map((variant) => {
      let optionsObj: Record<string, string> = {};
      if (variant.options) {
        if (variant.options instanceof Map) {
          optionsObj = Object.fromEntries(variant.options.entries());
        } else {
          // Already an object when using .lean()
          optionsObj = variant.options as Record<string, string>;
        }
      }
      return {
        ...variant,
        options: optionsObj,
      };
    });

    return {
      ...product,
      variants: variantsWithOptions,
      // Add top image URL for convenience
      top_image:
        product.images_url[product.top_image_index] || product.images_url[0],
      hover_image:
        product.hover_image_index !== undefined
          ? product.images_url[product.hover_image_index]
          : null,
    };
  }

  async update(id: string, updateDto: UpdateProductDto) {
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Product not found');
    return { deleted: true };
  }

  async search(searchString: string) {
    console.log(searchString);

    const searchedProducts = await this.productModel
      .find(
        { $text: { $search: searchString } },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .select(
        'title base_price images_url top_image_index hover_image_index slug',
      )
      .lean();

    return { searchResult: searchedProducts };
  }

  // Category CRUD methods
  async createCategory(createDto: CreateCategoryDto) {
    // Validate parent if provided
    if (createDto.parent) {
      const parentCategory = await this.categoryModel.findById(
        createDto.parent,
      );
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const created = await this.categoryModel.create({
      name: createDto.name,
      parent: createDto.parent ? new Types.ObjectId(createDto.parent) : null,
      isActive: createDto.isActive ?? true,
    });

    // Update parent's children array if parent exists
    if (createDto.parent) {
      await this.categoryModel.findByIdAndUpdate(createDto.parent, {
        $addToSet: { children: created._id },
      });
    }

    return created;
  }

  async findAllCategories(
    page: number = 1,
    limit: number = 10,
    parent?: string,
  ) {
    const filter: FilterQuery<CategoryDocument> = { isDeleted: false };

    if (parent) {
      if (parent === 'null' || parent === '') {
        filter.parent = null;
      } else {
        filter.parent = new Types.ObjectId(parent);
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOneCategory(id: string) {
    let category;
    if (!Types.ObjectId.isValid(id)) {
      category = await this.categoryModel
        .findOne({ slug: id, isDeleted: false })
        // .populate('children')
        .lean();
    } else {
      category = await this.categoryModel
        .findOne({ _id: id, isDeleted: false })
        // .populate('children')
        .lean();
    }

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }

    // Validate parent if provided
    if (updateDto.parent !== undefined) {
      if (updateDto.parent) {
        // Check if parent exists
        const parentCategory = await this.categoryModel.findById(
          updateDto.parent,
        );
        if (!parentCategory) {
          throw new NotFoundException('Parent category not found');
        }
        // Prevent circular reference (category cannot be its own parent or ancestor)
        if (updateDto.parent === id) {
          throw new BadRequestException('Category cannot be its own parent');
        }
        // Check if parent is a descendant
        const parentAncestors = parentCategory.ancestors || [];
        const isDescendant = parentAncestors.some(
          (ancestor) => ancestor._id.toString() === id,
        );
        if (isDescendant) {
          throw new BadRequestException('Cannot set a descendant as parent');
        }
      }

      // Update parent's children arrays
      const oldParent = category.parent;
      if (oldParent) {
        await this.categoryModel.findByIdAndUpdate(oldParent, {
          $pull: { children: category._id },
        });
      }
      if (updateDto.parent) {
        await this.categoryModel.findByIdAndUpdate(updateDto.parent, {
          $addToSet: { children: category._id },
        });
      }
    }

    // Update category
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Category not found');
    }

    return updated;
  }

  async removeCategory(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    const hasChildren = category.children && category.children.length > 0;
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete category with children. Please delete or reassign children first.',
      );
    }

    // Soft delete
    const deleted = await this.categoryModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .lean();

    // Remove from parent's children array
    if (category.parent) {
      await this.categoryModel.findByIdAndUpdate(category.parent, {
        $pull: { children: category._id },
      });
    }

    return { deleted: true, category: deleted };
  }
}
