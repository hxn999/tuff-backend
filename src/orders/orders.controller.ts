import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AbilitiesGuard } from 'src/casl/abilities.guard';
import { RequestWithAuth } from 'src/auth/auth.controller';
import { PublicAuthGuard } from 'src/auth/public-auth.guard';
import {
  OrderCreateResponseDto,
  OrderResponseDto,
  OrderListResponseDto,
} from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(PublicAuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Create a new order with items from cart or provided items. If user is authenticated, items are taken from their cart. Stock is automatically updated for ordered variants.',
  })
  @ApiBody({description:"Fields required to create an order", type:CreateOrderDto})
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderCreateResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid order data, variant does not belong to product, or insufficient stock',
  })
  @ApiNotFoundResponse({
    description: 'Product or variant not found',
  })
  async create(
    @Req() req: RequestWithAuth,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user?._id, createOrderDto);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all orders',
    description:
      'Retrieve a paginated list of orders with filtering options. Requires authentication.',
  })
  @ApiOkResponse({
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  async findAll(@Query() queryDto: QueryOrdersDto) {
    return this.ordersService.findAll(queryDto);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get single order',
    description:
      'Retrieve a single order by ID (MongoDB ObjectId) or orderId. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (MongoDB ObjectId) or orderId (e.g., ORD-12345)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // @UseGuards(AuthGuard, AbilitiesGuard)
  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateOrderDto: UpdateOrderDto,
  // ) {
  //   return this.ordersService.update(id, updateOrderDto);
  // }

  // @UseGuards(AuthGuard, AbilitiesGuard)
  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // async remove(@Param('id') id: string) {
  //   return this.ordersService.remove(id);
  // }
}
