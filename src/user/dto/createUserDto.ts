import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  Matches,
  IsEnum,
  ValidateIf,
  IsPhoneNumber,
} from 'class-validator';
// import { UserRol } from './user-role.enum';
import { UserRole } from '../userRolesEnum';
import { IsEmailOrPhone } from '../decorators/emailOrPhone';
import { NormalizeBDPhone } from 'src/auth/decorators/normalizePhoneBd';
import { Transform } from 'class-transformer';
import { normalizeBDPhoneNumber } from 'src/lib/util/normalizePhone';

/**
 * Data Transfer Object for creating a new user.
 * Validation mirrors the requirements set in the Mongoose schema.
 */
export class CreateUserDto {
  // name: string (required, trim)
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  // email: string (required, trim)
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsOptional()
  email?: string;

  // phone: string (optional, trim)
  @IsOptional()
  @IsString({ message: 'Phone must be a string.' })
  @IsPhoneNumber('BD')
  phone?: string;

  // password: string (required) - Enforcing complexity: min 8, uppercase, number, special char
  
  @IsEmailOrPhone()
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;


  
}
