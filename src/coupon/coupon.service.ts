import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponsDto } from './dto/query-coupons.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private couponModel: Model<CouponDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createDto: CreateCouponDto) {
    // Validate dates
    if (new Date(createDto.validFrom) >= new Date(createDto.validUntil)) {
      throw new BadRequestException('validFrom must be before validUntil');
    }

    // Check if coupon code already exists
    const existing = await this.couponModel.findOne({
      code: createDto.code.toUpperCase(),
    });
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    const coupon = await this.couponModel.create({
      ...createDto,
      code: createDto.code.toUpperCase(),
    });

    return coupon;
  }

  async findAll(queryDto: QueryCouponsDto) {
    const { page = 1, limit = 10, isActive, search } = queryDto;

    const filter: FilterQuery<CouponDocument> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (search && search.trim()) {
      filter.$or = [
        { code: { $regex: search.trim(), $options: 'i' } },
        { note: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.couponModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.couponModel.countDocuments(filter),
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
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponModel.findById(id).lean();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.couponModel
      .findOne({ code: code.toUpperCase() })
      .lean();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(id: string, updateDto: UpdateCouponDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    // Validate dates if both are provided
    if (updateDto.validFrom && updateDto.validUntil) {
      if (new Date(updateDto.validFrom) >= new Date(updateDto.validUntil)) {
        throw new BadRequestException('validFrom must be before validUntil');
      }
    }

    // If updating code, check for duplicates
    if (updateDto.code) {
      const existing = await this.couponModel.findOne({
        code: updateDto.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('Coupon code already exists');
      }
      updateDto.code = updateDto.code.toUpperCase();
    }

    const updated = await this.couponModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Coupon not found');
    }

    return updated;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const deleted = await this.couponModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw new NotFoundException('Coupon not found');
    }

    return { deleted: true, message: 'Coupon deleted successfully' };
  }

  async validateCoupon(userId: string | undefined, validateDto: ValidateCouponDto) {
    let { code, cart } = validateDto;

    if (userId) {
      const user = await this.userModel.findById(userId);
      if (user) cart = user.cart;
    }

    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    // Check date validity
    const now = new Date();
    if (now < new Date(coupon.validFrom)) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (now > new Date(coupon.validUntil)) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    let productIdArr = cart.map((p) => p.product._id);

    let totalOrderAmount = 0;

    let products = await this.productModel.find({
      _id: {
        $in: productIdArr,
      },
    });

    if (products.length !== productIdArr.length) {
      cart.forEach((e) => {
        if (!products.some((p) => p._id.toString() == e.product._id)) {
          throw new NotFoundException(
            `Product ${e.product.title} does not exists , please remove it from cart`,
          );
        }
      });
    }

    cart.forEach((p) => {
      let product = products.find((e) => e._id.toString() === p.product._id);
      if (!product)
        throw new NotFoundException(
          `Product ${p.product.title} does not exists , please remove it from cart`,
        );
      let price = product.options.find((o) => o.type === p.variant.type)?.price;
      if (!price) throw new NotFoundException(
        `Your selected variant for Product ${p.product.title} does not exists`,
      );
      totalOrderAmount += price*p.quantity;
    });



    // Check minimum order amount
    if (totalOrderAmount < coupon.minOrderAmount) {
        throw new BadRequestException(
            `Minimum order amount of ${coupon.minOrderAmount} required`,
        );
    }


    let discount = coupon.discountType==='percentage'? totalOrderAmount*(coupon.discountValue/100):coupon.discountValue;

    if(coupon.maxDiscountAmount&&discount>coupon.maxDiscountAmount) discount = coupon.maxDiscountAmount;



    // Check global usage limit

    // // Check per-user limit
    // const userUsage = coupon.usages.find(
    //     (u) => u.userId.toString() === userId,
    // );
    // if (userUsage && userUsage.timesUsed >= coupon.perUserLimit) {
    //     throw new BadRequestException(
    //         'You have reached the usage limit for this coupon',
    //     );
    // }

    // // Check applicable products
    // if (coupon.applicableProducts.length > 0 && productIds.length > 0) {
    //     const hasApplicableProduct = productIds.some((pid) =>
    //         coupon.applicableProducts.some(
    //             (apid) => apid.toString() === pid,
    //         ),
    //     );
    //     if (!hasApplicableProduct) {
    //         throw new BadRequestException(
    //             'Coupon not applicable to products in cart',
    //         );
    //     }
    // }

    // // Calculate discount
    // let discountAmount = 0;
    // if (coupon.discountType === 'percentage') {
    //     discountAmount = (cartTotal * coupon.discountValue) / 100;
    //     if (
    //         coupon.maxDiscountAmount &&
    //         discountAmount > coupon.maxDiscountAmount
    //     ) {
    //         discountAmount = coupon.maxDiscountAmount;
    //     }
    // } else {
    //     discountAmount = coupon.discountValue;
    // }

    // Ensure discount doesn't exceed cart total
    discount = Math.min(discount, totalOrderAmount);

    return {
      valid: true,
      coupon,
      discount
    };
  }

  async applyCoupon(couponId: string, userId: string) {
    if (!Types.ObjectId.isValid(couponId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid ID');
    }

    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Increment usage count
    coupon.usedCount += 1;

    // Update user-specific usage
    const userUsageIndex = coupon.usages.findIndex(
      (u) => u.userId.toString() === userId,
    );

    if (userUsageIndex >= 0) {
      coupon.usages[userUsageIndex].timesUsed += 1;
      coupon.usages[userUsageIndex].lastUsed = new Date();
    } else {
      coupon.usages.push({
        userId: new Types.ObjectId(userId),
        timesUsed: 1,
        lastUsed: new Date(),
      });
    }

    await coupon.save();

    return { success: true, message: 'Coupon applied successfully' };
  }
}
