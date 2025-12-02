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
}
