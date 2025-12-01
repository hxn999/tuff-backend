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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AbilitiesGuard } from 'src/casl/abilities.guard';
import { RequestWithAuth } from 'src/auth/auth.controller';
import { PublicAuthGuard } from 'src/auth/public-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(PublicAuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: RequestWithAuth,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user?._id, createOrderDto);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Get()
  async findAll(@Query() queryDto: QueryOrdersDto) {
    return this.ordersService.findAll(queryDto);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
