import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { DeleteResult, Model, UpdateWriteOpResult } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/createUserDto';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { default_pfp_url } from 'src/lib/util/constants';
import { AddToCartDto } from './dto/addToCart';
import { UpdateCartQuantityDto } from './dto/updateCartQuantity.dto';
import { RemoveCartItemDto } from './dto/removeCartItem.dto';
import {
  Product,
  ProductDocument,
  ProductVariant,
  ProductVariantDocument,
} from 'src/products/schemas/product.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariantDocument>,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async create(user: CreateUserDto): Promise<UserDocument> {
    // checks for duplicate accounts
    const identifier: string | undefined = user.email ? user.email : user.phone;
    let foundUser = await this.userModel
      .findOne({ $or: [{ email: identifier }, { phone: identifier }] })
      .exec();
    if (foundUser) {
      throw new ConflictException(`Account with ${identifier} already exists!`);
    }

    // hashing user's password for security
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltOrRounds);
    user.password = hashedPassword;

    const createdUser = new this.userModel({
      ...user,
      pfp: default_pfp_url,
    });
    return await createdUser.save();
  }

  async findOne(query: string): Promise<UserDocument> {
    // matches with email or mongo id

    let user;
    if (Types.ObjectId.isValid(query)) {
      user = await this.userModel
        .findOne({ _id: new Types.ObjectId(query) })
        .exec();
    } else {
      user = await this.userModel
        .findOne({ $or: [{ email: query }, { phone: query }] })
        .exec();
    }

    if (!user) {
      throw new NotFoundException(`User with id ${query} not found`);
    }
    return user;
  }

  async findMany(query: Object): Promise<UserDocument[]> {
    // matches with email or mongo id

    let users = await this.userModel.find(query).exec();

    if (!users) {
      throw new NotFoundException(`User with id ${query} not found`);
    }
    return users;
  }

  async deleteOne(query: string): Promise<DeleteResult> {
    // matches with email or mongo id
    let deletedUserResult;
    if (Types.ObjectId.isValid(query)) {
      deletedUserResult = await this.userModel
        .deleteOne({ _id: new Types.ObjectId(query) })
        .exec();
    } else {
      deletedUserResult = await this.userModel
        .deleteOne({ email: query })
        .exec();
    }

    if (!deletedUserResult) {
      throw new NotFoundException(`User with id ${query} not found`);
    }
    return deletedUserResult;
  }

  // async deleteMany(query: string): Promise<DeleteResult> {
  //   try {
  //     // matches with email or mongo id
  //     let deletedUserResult;
  //     if (Types.ObjectId.isValid(query)) {
  //       deletedUserResult = await this.userModel.deleteMany({ _id:  new Types.ObjectId(query) }).exec();
  //     }
  //     else{
  //       deletedUserResult = await this.userModel.deleteMany({ email:  query }).exec();
  //     }
  //     return deletedUserResult;
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }
  async updateOne(query: string, updatedUser): Promise<UpdateWriteOpResult> {
    try {
      // matches with email or mongo id
      let updatedUserResult;
      if (Types.ObjectId.isValid(query)) {
        updatedUserResult = await this.userModel
          .updateOne({ _id: new Types.ObjectId(query) }, { $set: updatedUser })
          .exec();
      } else {
        updatedUserResult = await this.userModel
          .updateOne({ email: query }, { $set: updatedUser })
          .exec();
      }
      return updatedUserResult;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCartItem(userId: string, productUpdate: AddToCartDto) {
    const user: UserDocument | null = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    // Find product and variant
    const product = await this.productModel.findById(productUpdate.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.productVariantModel.findById(
      productUpdate.variantId,
    );
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Validate variant belongs to product
    if (variant.productId.toString() !== product._id.toString()) {
      throw new BadRequestException('Variant does not belong to this product');
    }

    // Find existing cart item with same product and variant
    const index = user.cart.findIndex(
      (item) =>
        item.productId.toString() === productUpdate.productId &&
        item.variantId.toString() === productUpdate.variantId,
    );

    if (index === -1) {
      throw new BadRequestException('Product item does not exist in the cart');
    }

    // Update the cart item
    const quantityToUpdate = productUpdate.quantity ?? 1;

    // Validate quantity doesn't exceed stock
    if (quantityToUpdate > variant.stock) {
      throw new BadRequestException('Quantity exceeds available stock');
    }

    // Update cart item with latest product/variant data
    user.cart[index] = {
      productId: product._id,
      variantId: variant._id,
      quantity: quantityToUpdate,
      title: product.title,
      image_url: product.images_url[product.top_image_index] || product.images_url[0],
      price: variant.price,
      slug: product.slug,
      selectedOptions: variant.options,
      sku: variant.sku,
    };

    await user.save();

    return {
      message: 'Cart item updated successfully',
      cart: user.cart,
    };
  }

  async addToCart(userId: string, productAdd: AddToCartDto) {
    console.log(productAdd);
    const user: UserDocument | null = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    // Find product and variant
    const product = await this.productModel.findById(productAdd.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.productVariantModel.findById(
      productAdd.variantId,
    );
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Validate variant belongs to product
    if (variant.productId.toString() !== product._id.toString()) {
      throw new BadRequestException('Variant does not belong to this product');
    }

    // Default quantity to 1 if not provided
    const quantityToAdd = productAdd.quantity ?? 1;

    // Check stock availability
    if (variant.stock < quantityToAdd) {
      throw new BadRequestException('Insufficient stock available');
    }

    // Find existing cart item with same product and variant
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.productId.toString() === productAdd.productId &&
        item.variantId.toString() === productAdd.variantId,
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = user.cart[existingItemIndex].quantity + quantityToAdd;

      // Validate total quantity doesn't exceed stock
      if (newQuantity > variant.stock) {
        throw new BadRequestException('Total quantity exceeds available stock');
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart with snapshot data
      user.cart.push({
        productId: product._id,
        variantId: variant._id,
        quantity: quantityToAdd,
        title: product.title,
        image_url:
          product.images_url[product.top_image_index] || product.images_url[0],
        price: variant.price,
        slug: product.slug,
        selectedOptions: variant.options,
        sku: variant.sku,
      });
    }

    await user.save();

    return {
      message: 'Product added to cart successfully',
      cart: user.cart,
    };
  }

  async getCart(userId: string) {
    let foundUser = await this.userModel.findById(userId);
    if (!foundUser) {
      throw new NotFoundException('User not found !');
    }

    return {
      cart: foundUser.cart,
    };
  }

  async updateCartQuantity(
    userId: string,
    updateQuantityDto: UpdateCartQuantityDto,
  ) {
    const user: UserDocument | null = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    // Find existing cart item with same product and variant
    const index = user.cart.findIndex(
      (item) =>
        item.productId.toString() === updateQuantityDto.productId &&
        item.variantId.toString() === updateQuantityDto.variantId,
    );

    if (index === -1) {
      throw new BadRequestException('Product item does not exist in the cart');
    }

    // Fetch current variant to check stock
    const variant = await this.productVariantModel.findById(
      user.cart[index].variantId,
    );
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Validate quantity doesn't exceed stock
    if (updateQuantityDto.newQuantity > variant.stock) {
      throw new BadRequestException('Quantity exceeds available stock');
    }

    // Update the quantity directly to newQuantity
    user.cart[index].quantity =
      updateQuantityDto.newQuantity > 1 ? updateQuantityDto.newQuantity : 1;

    await user.save();

    return {
      message: 'Cart quantity updated successfully',
      cart: user.cart,
    };
  }

  async clearCart(userId: string) {
    const user: UserDocument | null = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    // Clear the entire cart
    user.cart = [];

    await user.save();

    return {
      message: 'Cart cleared successfully',
      cart: user.cart,
    };
  }

  async removeCartItem(userId: string, removeItemDto: RemoveCartItemDto) {
    const user: UserDocument | null = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    // Find existing cart item with same product and variant
    const index = user.cart.findIndex(
      (item) =>
        item.productId.toString() === removeItemDto.productId &&
        item.variantId.toString() === removeItemDto.variantId,
    );

    if (index === -1) {
      throw new BadRequestException('Product item does not exist in the cart');
    }

    // Remove the item from cart
    user.cart.splice(index, 1);

    await user.save();

    return {
      message: 'Cart item removed successfully',
      cart: user.cart,
    };
  }
}
