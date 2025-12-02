import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import {
  Product,
  ProductSchema,
  ProductVariant,
  ProductVariantSchema,
} from 'src/products/schemas/product.schema';
import { UserModule } from 'src/user/user.module';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    UserModule,
    ProductsModule,
    AuthModule,
    CaslModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Counter.name, schema: CounterSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },

    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
