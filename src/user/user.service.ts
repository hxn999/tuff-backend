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

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
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

    // Validate variant exists in product options
    const variantExists = productUpdate.product.options.some(
      (opt) =>
        opt.type === productUpdate.variant.type &&
        opt.price === productUpdate.variant.price,
    );
    if (!variantExists) {
      throw new BadRequestException('Invalid variant for this product');
    }

    // Find existing cart item with same product and variant
    const index = user.cart.findIndex(
      (item) =>
        item.product._id === productUpdate.product._id &&
        item.variant.type === productUpdate.variant.type,
    );

    if (index === -1) {
      throw new BadRequestException('Product item does not exist in the cart');
    }

    // Update the cart item
    const quantityToUpdate = productUpdate.quantity ?? 1;

    // Validate quantity doesn't exceed stock
    if (quantityToUpdate > productUpdate.product.stock) {
      throw new BadRequestException('Quantity exceeds available stock');
    }

    user.cart[index] = {
      quantity: quantityToUpdate,
      variant: productUpdate.variant,
      product: productUpdate.product,
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

    // Validate variant exists in product options
    const variantExists = productAdd.product.options.some(
      (opt) =>
        opt.type === productAdd.variant.type &&
        opt.price === productAdd.variant.price,
    );
    if (!variantExists) {
      throw new BadRequestException('Invalid variant for this product');
    }

    // Default quantity to 1 if not provided
    const quantityToAdd = productAdd.quantity ?? 1;

    // Check stock availability
    if (productAdd.product.stock < quantityToAdd) {
      throw new BadRequestException('Insufficient stock available');
    }

    // Find existing cart item with same product and variant
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.product._id === productAdd.product._id &&
        item.variant.type === productAdd.variant.type,
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = user.cart[existingItemIndex].quantity + quantityToAdd;

      // Validate total quantity doesn't exceed stock
      if (newQuantity > productAdd.product.stock) {
        throw new BadRequestException('Total quantity exceeds available stock');
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      user.cart.push({
        quantity: quantityToAdd,
        variant: productAdd.variant,
        product: productAdd.product,
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
        item.product._id === updateQuantityDto.productId &&
        item.variant.type === updateQuantityDto.variantType,
    );

    if (index === -1) {
      throw new BadRequestException('Product item does not exist in the cart');
    }

    // Validate quantity doesn't exceed stock
    if (updateQuantityDto.newQuantity > user.cart[index].product.stock) {
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
        item.product._id === removeItemDto.productId &&
        item.variant.type === removeItemDto.variantType,
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
