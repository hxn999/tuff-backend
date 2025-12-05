import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/lib/multer';
import {
  ProductListResponseDto,
  ProductDetailResponseDto,
  ProductSearchResponseDto,
  ProductCreateResponseDto,
} from './dto/product-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  CategoryListResponseDto,
} from './dto/category-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve a paginated list of products with filtering options',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    type: ProductListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  async getAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Search products',
    description:
      'Search products by text query. Returns matching products based on title and description.',
  })
  @ApiQuery({
    name: 'text',
    description: 'Search text to query products',
    example: 'amazing product',
    required: true,
  })
  @ApiOkResponse({
    description: 'Search completed successfully',
    type: ProductSearchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid search query',
  })
  async searchProducts(@Query('text') searchString: string) {
    return this.productsService.search(searchString);
  }

  @Get('single')
  @ApiOperation({
    summary: 'Get single product',
    description:
      'Retrieve a single product by ID or slug with all its variants',
  })
  @ApiQuery({
    name: 'id',
    description: 'Product ID (MongoDB ObjectId) or slug',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @ApiOkResponse({
    description: 'Product retrieved successfully',
    type: ProductDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  async getSingle(@Query('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiOperation({
    summary: 'Upload/create product',
    description:
      'Create a new product with images and variants. Images are uploaded via multipart/form-data.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with images',
    type: CreateProductDto,
  })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: ProductCreateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid product data or image indices out of bounds',
  })
  async create(
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.productsService.create(files, body);
  }

  // PATCH /products/update?id=...
  // @Patch('update')
  // async update(@Query('id') id: string, @Body() body: UpdateProductDto) {
  //   return this.productsService.update(id, body);
  // }

  // // DELETE /products?id=...
  // @Delete()
  // async remove(@Query('id') id: string) {
  //   return this.productsService.remove(id);
  // }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('image', multerConfig))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   const result = await this.cloudinaryService.uploadFile(file)
  //   console.log(result)
  //   return 'uploaded!';
  // }

  // @Post('upload-many')
  // @UseInterceptors(FilesInterceptor('images',3, multerConfig))
  // async uploadManyFile(@UploadedFiles() files:Array< Express.Multer.File>) {
  //   console.log(files);
  //   return 'uploaded!';
  // }

  // Category CRUD endpoints
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Create a new category. Can optionally specify a parent category to create a subcategory.',
  })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid category data or parent category not found',
  })
  async createCategory(@Body() createDto: CreateCategoryDto) {
    return this.productsService.createCategory(createDto);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieve a paginated list of categories. Can filter by parent category.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'parent',
    description:
      'Filter by parent category ID. Use "null" or empty string for root categories.',
    example: '507f1f77bcf86cd799439011',
    required: false,
    type: String,
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    type: CategoryListResponseDto,
  })
  async getAllCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('parent') parent?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productsService.findAllCategories(pageNum, limitNum, parent);
  }

  @Get('categories/:id')
  @ApiOperation({
    summary: 'Get a single category',
    description:
      'Retrieve a single category by ID or slug with all its details.',
  })
  @ApiOkResponse({
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  async getSingleCategory(@Param('id') id: string) {
    return this.productsService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @ApiOperation({
    summary: 'Update a category',
    description:
      'Update category details. Can change name, parent, or active status.',
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data or circular reference detected',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.productsService.updateCategory(id, updateDto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a category',
    description:
      "Soft delete a category. Category must not have children. Removes category from parent's children array.",
  })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true },
        category: { type: 'object' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiBadRequestResponse({
    description: 'Category has children and cannot be deleted',
  })
  async removeCategory(@Param('id') id: string) {
    return this.productsService.removeCategory(id);
  }
}
