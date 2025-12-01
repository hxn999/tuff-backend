import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponsDto } from './dto/query-coupons.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { PublicAuthGuard } from 'src/auth/public-auth.guard';
import { Request } from 'express';
import { RequestWithAuth } from 'src/auth/auth.controller';

@Controller('coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    // POST /coupons - Create a new coupon
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCouponDto: CreateCouponDto) {
        return this.couponService.create(createCouponDto);
    }

    // GET /coupons - Get all coupons with pagination and filtering
    @Get()
    async findAll(@Query() query: QueryCouponsDto) {
        return this.couponService.findAll(query);
    }

    // GET /coupons/:id - Get a single coupon by ID
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.couponService.findOne(id);
    }

    // GET /coupons/code/:code - Get a coupon by code
    @Get('code/:code')
    async findByCode(@Param('code') code: string) {
        return this.couponService.findByCode(code);
    }

    // PATCH /coupons/:id - Update a coupon
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCouponDto: UpdateCouponDto,
    ) {
        return this.couponService.update(id, updateCouponDto);
    }

    // DELETE /coupons/:id - Delete a coupon
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.couponService.remove(id);
    }

    // POST /coupons/validate - Validate a coupon for a cart
    @UseGuards(PublicAuthGuard)
    @Post('validate')
    @HttpCode(HttpStatus.OK)
    async validate( @Req() req:RequestWithAuth, @Body() validateCouponDto: ValidateCouponDto) {
        return this.couponService.validateCoupon(req.user?._id,validateCouponDto);
    }

    // POST /coupons/apply - Apply a coupon (increment usage)
    // @Post('apply')
    // @HttpCode(HttpStatus.OK)
    // async apply(
    //     @Body() body: { couponId: string; userId: string },
    // ) {
    //     return this.couponService.applyCoupon(body.couponId, body.userId);
    // }
}
