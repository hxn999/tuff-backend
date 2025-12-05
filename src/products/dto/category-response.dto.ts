import { ApiProperty } from '@nestjs/swagger';

export class CategoryAncestorDto {
  @ApiProperty({ description: 'Ancestor category ID' })
  _id: string;

  @ApiProperty({ description: 'Ancestor category name', example: 'Electronics' })
  name: string;

  @ApiProperty({ description: 'Ancestor category slug', example: 'electronics' })
  slug: string;
}

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  _id: string;

  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  name: string;

  @ApiProperty({ description: 'Category slug', example: 'electronics' })
  slug: string;

  @ApiProperty({
    description: 'Parent category ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  parent?: string;

  @ApiProperty({
    description: 'Array of child category IDs',
    type: [String],
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
  })
  children: string[];

  @ApiProperty({
    description: 'Array of ancestor categories',
    type: [CategoryAncestorDto],
  })
  ancestors: CategoryAncestorDto[];

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the category is deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({ description: 'Category creation date', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'Category last update date', required: false })
  updatedAt?: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({
    description: 'Array of categories',
    type: [CategoryResponseDto],
  })
  items: CategoryResponseDto[];

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of categories', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

