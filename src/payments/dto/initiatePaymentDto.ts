import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsCurrency,
    IsEmail,
    IsPhoneNumber,
    MaxLength,
    Min,
  } from 'class-validator';
  
  export class InitiatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    readonly total_amount: number;
  
    @IsString()
    @IsNotEmpty()
    readonly currency: string;
  
    @IsString()
    @IsNotEmpty()
    readonly shipping_method: string;
  
    @IsString()
    @IsNotEmpty()
    readonly product_name: string;
  
    @IsString()
    @IsNotEmpty()
    readonly product_category: string;
  
    @IsString()
    @IsNotEmpty()
    readonly product_profile: string;
  
    @IsString()
    @IsNotEmpty()
    readonly cus_name: string;
  
    @IsEmail()
    @IsNotEmpty()
    readonly cus_email: string;
  
    @IsString()
    @IsNotEmpty()
    readonly cus_add1: string;
  
    @IsString()
    readonly cus_add2: string;
  
    @IsString()
    @IsNotEmpty()
    readonly cus_city: string;
  
    @IsString()
    @IsNotEmpty()
    readonly cus_state: string;
  
    @IsString()
    @IsNotEmpty()
    readonly cus_postcode: string;
  
    @IsString()
    @IsNotEmpty()
    readonly cus_country: string;
  
    @IsPhoneNumber('BD')
    @IsNotEmpty()
    readonly cus_phone: string;
  
    @IsString()
    readonly cus_fax: string;
  
    @IsString()
    @IsNotEmpty()
    readonly ship_name: string;
  
    @IsString()
    @IsNotEmpty()
    readonly ship_add1: string;
  
    @IsString()
    readonly ship_add2: string;
  
    @IsString()
    @IsNotEmpty()
    readonly ship_city: string;
  
    @IsString()
    @IsNotEmpty()
    readonly ship_state: string;
  
    @IsString()
    @IsNotEmpty()
    readonly ship_postcode: string;
  
    @IsString()
    @IsNotEmpty()
    readonly ship_country: string;
  }