import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { generateSlug } from 'src/lib/util/slugGenerator';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
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

    const public_url = generateSlug(createDto.title);
    // const sku =
    const created = await this.productModel.create({
      ...createDto,
      images_url,
      public_url,
    });

    console.log(created);

    return {
      message: 'Product uploaded successfully !',
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
      filter.price = {} as any;
      if (minPrice != null) (filter.price as any).$gte = minPrice;
      if (maxPrice != null) (filter.price as any).$lte = maxPrice;
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
      queryWithSelect.skip(skip).limit(limit).sort(sortOptions).lean(),
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
    if (!Types.ObjectId.isValid(id)) {
      const product = await this.productModel
        .findOne({ public_url: id })
        .lean();
      if (!product) throw new NotFoundException('Product not found');
      return product;
    }
    const product = await this.productModel.findById(id).lean();
    if (!product) throw new NotFoundException('Product not found');
    return product;
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
      .select('title price images_url top_image');

    return { searchedProducts };
  }
}
