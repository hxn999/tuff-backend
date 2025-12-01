import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class UpdateCartQuantityDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  variantType: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  newQuantity: number;
}
