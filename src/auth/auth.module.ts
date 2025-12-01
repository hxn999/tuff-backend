import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refreshToken.schema';
import { RefreshTokenService } from './refreshToken.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { CaslModule } from 'src/casl/casl.module';


@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        // Retrieve the secret and expiration time from environment variables
        secret:
          configService.get<string>('JWT_SECRET') ||
          'your-default-jwt-secret-key-change-this-in-production',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') || '1h',
        },
      }),
    }),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    HttpModule,
    ConfigModule,
    CaslModule
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService,AuthGuard],
  exports:[AuthGuard]
})
export class AuthModule {}
