import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './schemas/order.schema';
import { Counter, CounterDocument } from './schemas/counter.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CouponService } from 'src/coupon/coupon.service';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { Coupon, CouponDocument } from 'src/coupon/schemas/coupon.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Counter.name)
    private counterModel: Model<CounterDocument>,
    @InjectModel(Coupon.name)
    private couponModel: Model<CouponDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    let user: UserDocument | null = null;
    if (userId) {
      user = await this.userModel.findById(userId);
      if (user) {
        createOrderDto.items = user.cart;
      }
    }

    let productIdArr = createOrderDto.items.map((p) => p.product._id);

    let totalOrderAmount = 0;

    let products = await this.productModel.find({
      _id: {
        $in: productIdArr,
      },
    });

    if (products.length !== productIdArr.length) {
      createOrderDto.items.forEach((e) => {
        if (!products.some((p) => p._id.toString() == e.product._id)) {
          throw new NotFoundException(
            `Product ${e.product.title} does not exists , please remove it from createOrderDto.items`,
          );
        }
      });
    }

    createOrderDto.items.forEach((p) => {
      let product = products.find((e) => e._id.toString() === p.product._id);
      if (!product)
        throw new NotFoundException(
          `Product ${p.product.title} does not exists , please remove it from createOrderDto.items`,
        );
      let price = product.options.find((o) => o.type === p.variant.type)?.price;
      if (!price)
        throw new NotFoundException(
          `Your selected variant for Product ${p.product.title} does not exists`,
        );
      totalOrderAmount += price * p.quantity;
    });

    let subtotal = totalOrderAmount;
    let totalAmount = subtotal + 60; //added shipping
    let discount = 0;
    if (createOrderDto.couponCode) {
      const coupon = await this.couponModel.findOne({
        code: (createOrderDto.couponCode as string).toUpperCase(),
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

      // Check minimum order amount
      if (totalOrderAmount < coupon.minOrderAmount) {
        throw new BadRequestException(
          `Minimum order amount of ${coupon.minOrderAmount} required`,
        );
      }

      discount =
        coupon.discountType === 'percentage'
          ? totalOrderAmount * (coupon.discountValue / 100)
          : coupon.discountValue;

      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount)
        discount = coupon.maxDiscountAmount;

      // Ensure discount doesn't exceed createOrderDto.items total
      discount = Math.min(discount, totalOrderAmount);

      coupon.usedCount++;
      await coupon.save();
    }

    totalAmount = totalAmount - discount;

    const order_id = await this.getNextOrderId();

    let order_data: Order = {
      orderId: order_id,
      items: createOrderDto.items,
      subtotal,
      discountAmount: discount,
      totalAmount,
      couponCode: createOrderDto.couponCode,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PENDING,
      shippingName: createOrderDto.shippingName,
      shippingPhone: createOrderDto.shippingPhone,
      shippingCity: createOrderDto.shippingCity,
      shippingDistrict: createOrderDto.shippingDistrict,
      shippingPhone2: createOrderDto.shippingPhone2,
      shippingAddress: createOrderDto.shippingAddress,
      shippingInstructions: createOrderDto.shippingInstructions,
    };
    if (user) {
      order_data.userId = user._id;
    }

    const order = await this.orderModel.create(order_data);

    if (user) {
      user.cart = [];
      user.orders.push(order._id);
      await user.save();
    }
    return {
      message: 'Your order has been created !',
      order,
    };
  }
  async getNextOrderId() {
    let counter = await this.counterModel.findOneAndUpdate(
      { id: 'order' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    return 'ORD-' + counter.seq;
  }

  async findAll(queryDto: QueryOrdersDto) {
    // TODO: Implement findAll with filtering logic
  }

  async findOne(id: string) {
    // TODO: Implement findOne logic
  }

  async update(id: string, updateDto: UpdateOrderDto) {
    // TODO: Implement update logic
  }

  async remove(id: string) {
    // TODO: Implement remove logic
  }
}
