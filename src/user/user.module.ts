import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Product, ProductSchema, ProductVariant, ProductVariantSchema } from 'src/products/schemas/product.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
    forwardRef(() => AuthModule),
    CaslModule,
  ],
  exports: [UserService],
})
export class UserModule {}
