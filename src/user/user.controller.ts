import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FindQueryDto } from './dto/findQueryDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AbilitiesGuard } from 'src/casl/abilities.guard';
import { CheckAbility } from 'src/casl/abilities.decorator';
import { Action } from 'src/casl/actionEnum';
import { RequestWithAuth } from 'src/auth/auth.controller';
import { AddToCartDto } from './dto/addToCart';
import { User } from './schemas/user.schema';
import { UpdateCartQuantityDto } from './dto/updateCartQuantity.dto';
import { RemoveCartItemDto } from './dto/removeCartItem.dto';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(AuthGuard, AbilitiesGuard)// checks those role that user has or not
  // @CheckAbility(Action.Manage, 'all')// sets rule which ability should have to access
  // @Get('')
  // async findAll(@Param('id') id: string) {
  //     return this.userService.findMany({});
  // }

  @Get('single/:id')
  async findOne(@Param('id') id: string) {
    console.log('hiiii');
    return this.userService.findOne(id);
  }

  @Post('find')
  async find(@Body() body: FindQueryDto) {
    return this.userService.findMany(body);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Patch('update')
  async updateAddress(@Req() req:RequestWithAuth, @Body() updatedUser: UpdateUserDto) {
    return this.userService.updateOne(req.user._id, updatedUser);
  }


  @UseGuards(AuthGuard, AbilitiesGuard)
  @Get('cart')
  async getCart(@Req() req: RequestWithAuth) {
    // if(!req.ability.can(Action.Update,User)) throw new UnauthorizedException("Users can only update their own account !")
    // console.log("hiiiiiiii")
    return this.userService.getCart(req.user._id);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Post('cart/add')
  async addToCart(
    @Req() req: RequestWithAuth,
    @Body() productAdd: AddToCartDto,
  ) {
    if (!req.ability.can(Action.Update, User))
      throw new UnauthorizedException(
        'Users can only update their own account !',
      );
    return this.userService.addToCart(req.user._id, productAdd);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Patch('cart/update')
  async updateCartProduct(
    @Req() req: RequestWithAuth,
    @Body() productUpdate: AddToCartDto,
  ) {
    if (!req.ability.can(Action.Update, User))
      throw new UnauthorizedException(
        'Users can only update their own account !',
      );
    return this.userService.updateCartItem(req.user._id, productUpdate);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Patch('cart/update-quantity')
  async updateCartQuantity(
    @Req() req: RequestWithAuth,
    @Body() updateQuantityDto: UpdateCartQuantityDto,
  ) {
    if (!req.ability.can(Action.Update, User))
      throw new UnauthorizedException(
        'Users can only update their own account !',
      );
    return this.userService.updateCartQuantity(req.user._id, updateQuantityDto);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Delete('cart/clear')
  async clearCart(@Req() req: RequestWithAuth) {
    if (!req.ability.can(Action.Update, User))
      throw new UnauthorizedException(
        'Users can only update their own account !',
      );
    return this.userService.clearCart(req.user._id);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Patch('cart/remove-item')
  async removeCartItem(
    @Req() req: RequestWithAuth,
    @Body() removeItemDto: RemoveCartItemDto,
  ) {
    if (!req.ability.can(Action.Update, User))
      throw new UnauthorizedException(
        'Users can only update their own account !',
      );
    return this.userService.removeCartItem(req.user._id, removeItemDto);
  }
}
