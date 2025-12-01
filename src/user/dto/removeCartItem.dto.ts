import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveCartItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  variantType: string;
}
