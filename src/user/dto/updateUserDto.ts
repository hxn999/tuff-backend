import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Matches,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

/**
 * Data Transfer Object for updating user information.
 * Includes validation for address, division, city, delivery instructions, name, and phone numbers.
 * Phone numbers are validated for Bangladesh format.
 */
export class UpdateUserDto {
  // name: string (optional, trim

  // phone: string (optional, trim) - Bangladesh phone number
  @IsOptional()
  @IsString({ message: 'Phone must be a string.' })
  @IsPhoneNumber('BD')
  phone?: string;

  // phone2: string (optional, trim) - Bangladesh phone number
  @IsOptional()
  @IsString({ message: 'Phone2 must be a string.' })
  @IsPhoneNumber('BD')
  phone2?: string;

  // address: string (optional, trim)
  @IsOptional()
  @IsString({ message: 'Address must be a string.' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters.' })
  address?: string;

  // division: string (optional, trim)
  @IsOptional()
  @IsString({ message: 'Division must be a string.' })
  @MaxLength(100, { message: 'Division cannot exceed 100 characters.' })
  district?: string;

  // city: string (optional, trim)
  @IsOptional()
  @IsString({ message: 'City must be a string.' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters.' })
  city?: string;

  // deliver_instructions: string (optional, trim)
  @IsOptional()
  @IsString({ message: 'Delivery instructions must be a string.' })
  @MaxLength(1000, {
    message: 'Delivery instructions cannot exceed 1000 characters.',
  })
  deliver_instructions?: string;
}
