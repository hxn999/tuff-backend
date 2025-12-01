import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,

} from 'class-validator';

export class PassresetDto {


  

  // password: string (required) - Enforcing complexity: min 8, uppercase, number, special char
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password is at least 8 characters long.' })
  password: string;


}
