import { IsNotEmpty, IsString, IsNumber, Min, IsMongoId } from 'class-validator';

export class UpdateCartQuantityDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsMongoId()
  @IsNotEmpty()
  variantId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  newQuantity: number;
}
