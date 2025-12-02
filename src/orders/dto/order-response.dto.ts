import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../schemas/order.schema';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  productId: string;

  @ApiProperty({ description: 'Product Variant ID', example: '507f1f77bcf86cd799439012' })
  variantId: string;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Product title', example: 'Amazing Product' })
  title: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  image_url: string;

  @ApiProperty({ description: 'Price at time of order', example: 29.99 })
  price: number;

  @ApiProperty({ description: 'Product slug', example: 'amazing-product' })
  slug: string;

  @ApiProperty({ description: 'Variant SKU', example: 'PROD-RED-LG' })
  sku: string;

  @ApiProperty({
    description: 'Selected variant options',
    example: { Color: 'Red', Size: 'Large' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  selectedOptions: Record<string, string>;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID (MongoDB ObjectId)' })
  _id: string;

  @ApiProperty({ description: 'Unique order ID', example: 'ORD-12345' })
  orderId: string;

  @ApiProperty({
    description: 'User ID who placed the order',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: 'Subtotal before discount', example: 100.0 })
  subtotal: number;

  @ApiProperty({ description: 'Discount amount', example: 10.0 })
  discountAmount: number;

  @ApiProperty({ description: 'Total amount after discount and shipping', example: 150.0 })
  totalAmount: number;

  @ApiProperty({
    description: 'Coupon code used',
    example: 'SAVE10',
    required: false,
  })
  couponCode?: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Payment ID reference',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  paymentId?: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  // Shipping Information
  @ApiProperty({ description: 'Shipping recipient name', example: 'John Doe' })
  shippingName: string;

  @ApiProperty({ description: 'Shipping phone number', example: '+8801712345678' })
  shippingPhone: string;

  @ApiProperty({
    description: 'Alternative shipping phone number',
    example: '+8801712345679',
    required: false,
  })
  shippingPhone2?: string;

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main Street, Apartment 4B',
  })
  shippingAddress: string;

  @ApiProperty({ description: 'Shipping district', example: 'Dhaka' })
  shippingDistrict: string;

  @ApiProperty({ description: 'Shipping city', example: 'Dhaka' })
  shippingCity: string;

  @ApiProperty({
    description: 'Shipping instructions',
    example: 'Please ring the doorbell twice',
    required: false,
  })
  shippingInstructions?: string;

  // Order tracking
  @ApiProperty({
    description: 'Tracking number',
    example: 'TRACK123456',
    required: false,
  })
  trackingNumber?: string;

  @ApiProperty({
    description: 'Date when order was shipped',
    required: false,
  })
  shippedAt?: Date;

  @ApiProperty({
    description: 'Date when order was delivered',
    required: false,
  })
  deliveredAt?: Date;

  @ApiProperty({ description: 'Order creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Order last update date' })
  updatedAt: Date;
}

export class OrderCreateResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Your order has been created !',
  })
  message: string;

  @ApiProperty({
    description: 'Created order',
    type: OrderResponseDto,
  })
  order: OrderResponseDto;
}

export class OrderListResponseDto {
  @ApiProperty({
    description: 'Array of orders',
    type: [OrderResponseDto],
  })
  items: OrderResponseDto[];

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of orders', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

