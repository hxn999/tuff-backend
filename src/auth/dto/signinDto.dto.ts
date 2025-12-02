import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  ValidateIf,
  IsPhoneNumber

} from 'class-validator';
import { IsEmailOrPhone } from 'src/user/decorators/emailOrPhone';
import { NormalizeBDPhone } from '../decorators/normalizePhoneBd';

export class SigninDto {

  // email: string (required, trim)
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsOptional()
  email?: string;

  // phone: string (optional, trim)
  @NormalizeBDPhone()
  @IsOptional()
  @IsString({ message: 'Phone must be a string.' })
  @IsPhoneNumber('BD')
  phone?: string;

  // password: string (required) - Enforcing complexity: min 8, uppercase, number, special char

  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  password: string;



}
