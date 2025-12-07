import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
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
import { User, UserDocument } from 'src/user/schemas/user.schema';
import {
  Product,
  ProductDocument,
  ProductVariant,
  ProductVariantDocument,
} from 'src/products/schemas/product.schema';
import { Types } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Counter.name)
    private counterModel: Model<CounterDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariantDocument>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    let user: UserDocument | null = null;
    if (userId) {
      user = await this.userModel.findById(userId);
      if (user) {
        // Convert ProductItem (ObjectId) to ProductItemDto (string)
        createOrderDto.items = user.cart.map((item) => ({
          productId: item.productId.toString(),
          variantId: item.variantId.toString(),
          quantity: item.quantity,
          title: item.title,
          image_url: item.image_url,
          price: item.price,
          slug: item.slug,
          sku: item.sku,
          selectedOptions: item.selectedOptions
            ? Object.fromEntries(item.selectedOptions)
            : undefined,
        }));
      }
    }

    // Extract product and variant IDs from cart items (convert strings to ObjectIds for query)
    const productIdArr = createOrderDto.items.map(
      (p) => new Types.ObjectId(p.productId),
    );
    const variantIdArr = createOrderDto.items.map(
      (p) => new Types.ObjectId(p.variantId),
    );

    let totalOrderAmount = 0;

    // Fetch products and variants to validate they exist
    const products = await this.productModel.find({
      _id: { $in: productIdArr },
    });

    const variants = await this.productVariantModel.find({
      _id: { $in: variantIdArr },
    });

    // Validate all products exist

    createOrderDto.items.forEach((e) => {
      if (!products.some((p) => p._id.toString() === e.productId.toString())) {
        throw new NotFoundException(
          `Product ${e.title} does not exist, please remove it from cart`,
        );
      }
    });

    // Validate all variants exist and belong to their products

    createOrderDto.items.forEach((e) => {
      if (!variants.some((v) => v._id.toString() === e.variantId.toString())) {
        throw new NotFoundException(
          `Variant for product ${e.title} does not exist, please remove it from cart`,
        );
      }
    });

    let producVariantBulkWriteArray: any[] = [];

    // Calculate total using variant prices (use price from cart item which is already validated)
    createOrderDto.items.forEach((item) => {
      const variant = variants.find(
        (v) => v._id.toString() === item.variantId.toString(),
      );
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );

      if (!variant) {
        throw new NotFoundException(
          `Variant for product ${item.title} does not exist`,
        );
      }

      if (!product) {
        throw new NotFoundException(`Product ${item.title} does not exist`);
      }

      // Validate variant belongs to product
      if (variant.productId.toString() !== product._id.toString()) {
        throw new BadRequestException(
          `Variant does not belong to product ${item.title}`,
        );
      }

      // Use price from cart item (snapshot) or current variant price
      // Cart item price is already validated when added to cart
      if (variant.stock < item.quantity)
        throw new NotFoundException(`${item.title} is not available in stock`);
      const itemPrice = variant.price;
      totalOrderAmount += itemPrice * item.quantity;

      let latestStock = variant.stock - item.quantity;
      producVariantBulkWriteArray.push({
        updateMany: {
          filter: { _id: variant._id },
          update: { $set: { stock: latestStock } },
        },
      });
    });

    let subtotal = totalOrderAmount;
    let totalAmount = subtotal + 60; //added shipping
    let discount = 0;
    // Coupon functionality removed - can be re-implemented later if needed
    // if (createOrderDto.couponCode) {
    //   // Coupon validation logic here
    // }

    totalAmount = totalAmount - discount;

    const order_id = await this.getNextOrderId();

    // Convert ProductItemDto (string IDs) to ProductItem (ObjectId) for schema
    const orderItems = createOrderDto.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      variantId: new Types.ObjectId(item.variantId),
      quantity: item.quantity,
      title: item.title,
      image_url: item.image_url,
      price: item.price,
      slug: item.slug,
      sku: item.sku,
      selectedOptions: item.selectedOptions
        ? new Map<string, string>(Object.entries(item.selectedOptions))
        : new Map<string, string>(),
    }));

    let order_data: Order = {
      orderId: order_id,
      items: orderItems,
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

    await this.productVariantModel.bulkWrite(producVariantBulkWriteArray);

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
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      paymentMethod,
      userId,
      couponCode,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = queryDto;

    const filter: FilterQuery<OrderDocument> = {};

    // Search by orderId, shippingName, or shippingPhone
    if (search && search.trim()) {
      filter.$or = [
        { orderId: { $regex: search.trim(), $options: 'i' } },
        { shippingName: { $regex: search.trim(), $options: 'i' } },
        { shippingPhone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by payment status
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Filter by payment method
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Filter by user ID
    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      filter.userId = new Types.ObjectId(userId);
    }

    // Filter by coupon code
    if (couponCode) {
      filter.couponCode = couponCode;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {} as any;
      if (startDate) {
        (filter.createdAt as any).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.createdAt as any).$lte = new Date(endDate);
      }
    }

    // Filter by amount range
    if (minAmount != null || maxAmount != null) {
      filter.totalAmount = {} as any;
      if (minAmount != null) {
        (filter.totalAmount as any).$gte = minAmount;
      }
      if (maxAmount != null) {
        (filter.totalAmount as any).$lte = maxAmount;
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email phone')
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    // Convert Map to object for JSON serialization in order items
    const itemsWithSerializedOptions = items.map((order) => {
      const serializedItems = order.items.map((item: any) => {
        let optionsObj: Record<string, string> = {};
        if (item.selectedOptions) {
          if (item.selectedOptions instanceof Map) {
            optionsObj = Object.fromEntries(item.selectedOptions.entries());
          } else {
            optionsObj = item.selectedOptions as Record<string, string>;
          }
        }
        return {
          ...item,
          productId: item.productId?.toString() || item.productId,
          variantId: item.variantId?.toString() || item.variantId,
          selectedOptions: optionsObj,
        };
      });

      return {
        ...order,
        _id: order._id.toString(),
        userId: order.userId
          ? typeof order.userId === 'object' && order.userId._id
            ? order.userId._id.toString()
            : order.userId.toString()
          : undefined,
        paymentId: order.paymentId?.toString() || order.paymentId,
        items: serializedItems,
      };
    });

    return {
      items: itemsWithSerializedOptions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    let order;

    // Check if id is a valid MongoDB ObjectId
    if (Types.ObjectId.isValid(id)) {
      order = await this.orderModel
        .findById(id)
        .populate('userId', 'name email phone')
        .populate('paymentId')
        .lean();
    } else {
      // If not a valid ObjectId, search by orderId
      order = await this.orderModel
        .findOne({ orderId: id })
        .populate('userId', 'name email phone')
        .populate('paymentId')
        .lean();
    }

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Convert Map to object for JSON serialization in order items
    const serializedItems = order.items.map((item: any) => {
      let optionsObj: Record<string, string> = {};
      if (item.selectedOptions) {
        if (item.selectedOptions instanceof Map) {
          optionsObj = Object.fromEntries(item.selectedOptions.entries());
        } else {
          optionsObj = item.selectedOptions as Record<string, string>;
        }
      }
      return {
        ...item,
        productId: item.productId?.toString() || item.productId,
        variantId: item.variantId?.toString() || item.variantId,
        selectedOptions: optionsObj,
      };
    });

    return {
      ...order,
      _id: order._id.toString(),
      userId: order.userId
        ? typeof order.userId === 'object' && order.userId._id
          ? order.userId._id.toString()
          : order.userId.toString()
        : undefined,
      paymentId: order.paymentId?.toString() || order.paymentId,
      items: serializedItems,
    };
  }

  async update(id: string, updateDto: UpdateOrderDto) {
    // TODO: Implement update logic
  }

  async remove(id: string) {
    // TODO: Implement remove logic
  }
}
