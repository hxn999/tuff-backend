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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/lib/multer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products
  @Get()
  async getAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  // GET /products/search
  @Get('/search')
  async searchProducts(@Query('text') searchString: string) {
    return this.productsService.search(searchString);
  }

  // GET /products/single?id=...
  @Get('single')
  async getSingle(@Query('id') id: string) {
    return this.productsService.findOne(id);
  }

  // POST /products
  @Post('/upload')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async create(
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.productsService.create(files, body);
  }

  // PATCH /products/update?id=...
  @Patch('update')
  async update(@Query('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  // DELETE /products?id=...
  @Delete()
  async remove(@Query('id') id: string) {
    return this.productsService.remove(id);
  }

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
