import { ApiProperty } from '@nestjs/swagger';

export class ProductVariantResponseDto {
  @ApiProperty({ description: 'Variant ID' })
  _id: string;

  @ApiProperty({ description: 'Product ID this variant belongs to' })
  productId: string;

  @ApiProperty({
    description: 'Variant options as key-value pairs',
    example: { Color: 'Red', Size: 'Large' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  options: Record<string, string>;

  @ApiProperty({ description: 'Stock Keeping Unit', example: 'PROD-RED-LG' })
  sku: string;

  @ApiProperty({ description: 'Variant price', example: 29.99 })
  price: number;

  @ApiProperty({ description: 'Stock quantity', example: 100 })
  stock: number;

  @ApiProperty({ description: 'Variant creation date', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'Variant last update date', required: false })
  updatedAt?: Date;
}

export class ProductItemResponseDto {
  @ApiProperty({ description: 'Product ID' })
  _id: string;

  @ApiProperty({ description: 'Product title', example: 'Amazing Product' })
  title: string;

  @ApiProperty({ description: 'Base/starting price', example: 19.99 })
  base_price: number;

  @ApiProperty({
    description: 'Array of product image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  images_url: string[];

  @ApiProperty({
    description: 'Index of the top/main image in images_url array',
    example: 0,
  })
  top_image_index: number;

  @ApiProperty({
    description: 'Index of the hover image in images_url array',
    example: 1,
    required: false,
  })
  hover_image_index?: number;

  @ApiProperty({
    description: 'Product slug for URL',
    example: 'amazing-product',
  })
  slug: string;
}

export class ProductDetailResponseDto {
  @ApiProperty({ description: 'Product ID' })
  _id: string;

  @ApiProperty({ description: 'Product title', example: 'Amazing Product' })
  title: string;

  @ApiProperty({
    description: 'Product description',
    example: 'This is an amazing product description...',
  })
  description: string;

  @ApiProperty({
    description: 'Array of product tags',
    example: ['tag1', 'tag2'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  category?: string;

  @ApiProperty({
    description: 'Product variant options configuration',
    example: [{ name: 'Color', values: ['Red', 'Blue'] }],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        values: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  options: Array<{ name: string; values: string[] }>;

  @ApiProperty({ description: 'Base/starting price', example: 19.99 })
  base_price: number;

  @ApiProperty({
    description: 'Array of product image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  images_url: string[];

  @ApiProperty({
    description: 'Index of the top/main image in images_url array',
    example: 0,
  })
  top_image_index: number;

  @ApiProperty({
    description: 'Index of the hover image in images_url array',
    example: 1,
    required: false,
  })
  hover_image_index?: number;

  @ApiProperty({
    description: 'Product slug for URL',
    example: 'amazing-product',
  })
  slug: string;

  @ApiProperty({
    description: 'Top/main image URL (convenience field)',
    example: 'https://example.com/image1.jpg',
  })
  top_image: string;

  @ApiProperty({
    description: 'Hover image URL (convenience field)',
    example: 'https://example.com/image2.jpg',
    required: false,
  })
  hover_image?: string;

  @ApiProperty({
    description: 'Product variants',
    type: [ProductVariantResponseDto],
  })
  variants: ProductVariantResponseDto[];

  @ApiProperty({ description: 'Product creation date', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'Product last update date', required: false })
  updatedAt?: Date;
}

export class ProductListResponseDto {
  @ApiProperty({
    description: 'Array of products',
    type: [ProductItemResponseDto],
  })
  items: ProductItemResponseDto[];

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of products', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

export class ProductSearchResponseDto {
  @ApiProperty({
    description: 'Search results',
    type: [ProductItemResponseDto],
  })
  searchResult: ProductItemResponseDto[];
}

export class ProductCreateResponseDto {
  @ApiProperty({ description: 'Success message', example: 'Product uploaded successfully !' })
  message: string;

  @ApiProperty({
    description: 'Created product',
    type: ProductDetailResponseDto,
  })
  product: ProductDetailResponseDto;
}

