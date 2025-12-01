import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { VariantDto } from 'src/user/dto/addToCart';
import { ProductItem } from 'src/user/schemas/user.schema';

export class ValidateCouponDto {
    @IsString()
    @IsNotEmpty()
    code: string;


    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductItem)
    cart: ProductItem[];
    
}
