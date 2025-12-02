import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { SigninDto } from './dto/signinDto.dto';
import { CreateUserDto } from 'src/user/dto/createUserDto';
import { PassresetDto } from './dto/passResetDto';
import { PasswordChangeDto } from './dto/passwordChangeDto';
import { AbilityTuple, MongoAbility, MongoQuery } from '@casl/ability';
import { Action } from 'src/casl/actionEnum';
import { AuthGuard } from './auth.guard';
import { AbilitiesGuard } from 'src/casl/abilities.guard';
import { ApiOkResponse, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
export class LoginRes{

  
  @ApiProperty()
  name: string;

  @ApiProperty()
  pfp: string;
 
}
export type RequestWithAuth = Request & { user: { _id: string } } & {
  ability: MongoAbility<AbilityTuple, MongoQuery>;
};



@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('login')
  async login(@Res({passthrough:true}) res: Response, @Body() credentials: SigninDto) {
    const identifier: string | undefined = credentials.email
      ? credentials.email
      : credentials.phone;
    if (!identifier) throw new BadRequestException();
    return this.authService.login(identifier, credentials.password, res);
  }

  // @Post('login-google')
  // async loginByGoogle(@Res() res: Response, @Query('code') code: string) {
  //   return this.authService.loginByGoogle(res, code);
  // }

  @Post('register')
  async register(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto, res);
  }

  // @Post('register-google')
  // async registerByGoogle(@Res() res: Response, @Query('code') code: string) {
  //   return this.authService.registerByGoogle(res, code);
  // }

  @Delete('logout')
  async logOut(@Req() req: Request, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshAccessToken(req, res);
  }

  @UseGuards(AuthGuard, AbilitiesGuard)
  @Post('password-change')
  async passwordChange(
    @Req() req: RequestWithAuth,
    @Res() res: Response,
    @Body() passchangeDto: PasswordChangeDto,
  ) {
    if (!req.user || !req.user._id) {
      throw new BadRequestException('User ID is missing from request');
    }

    return this.authService.changePassword(
      req,
      passchangeDto.prevPassword,
      passchangeDto.newPassword,
      res,
    );
  }

  @Get('password-reset-request/')
  async otp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('password-reset')
  async passwordReset(
    @Query('token') token: string,
    @Body() passResetDto: PassresetDto,
  ) {
    return this.authService.resetPassword(token, passResetDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: RequestWithAuth) {
    if (!req.user || !req.user._id) {
      throw new BadRequestException('User ID is missing from request');
    }

    const user = await this.authService.getCurrentUser(req.user._id);
    return user;
  }
}
