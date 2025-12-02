import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class RemoveCartItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsMongoId()
  @IsNotEmpty()
  variantId: string;
}
