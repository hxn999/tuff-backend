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
        if (
          !products.some((p) => p._id.toString() === e.productId.toString())
        ) {
          throw new NotFoundException(
            `Product ${e.title} does not exist, please remove it from cart`,
          );
        }
      });
    

    // Validate all variants exist and belong to their products
   
      createOrderDto.items.forEach((e) => {
        if (
          !variants.some((v) => v._id.toString() === e.variantId.toString())
        ) {
          throw new NotFoundException(
            `Variant for product ${e.title} does not exist, please remove it from cart`,
          );
        }
      });
    
      let producVariantBulkWriteArray:any[]=[];

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
      if(variant.stock<item.quantity) throw new NotFoundException(`${item.title} is not available in stock`)
      const itemPrice = variant.price;
      totalOrderAmount += itemPrice * item.quantity;

      let latestStock =variant.stock-item.quantity
      producVariantBulkWriteArray.push({
        updateMany:{
          filter:{_id:variant._id},
          update:{$set:{stock:latestStock}}
        }
      })

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
