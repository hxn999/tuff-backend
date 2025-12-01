// decorators/normalizeBDPhone.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Transform, TransformOptions } from 'class-transformer';

export function NormalizeBDPhone(validationOptions?: ValidationOptions & { removeCountryCode?: boolean }) {
  return function (object: Object, propertyName: string) {
    // First, register the validation
    registerDecorator({
      name: 'normalizeBDPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Phone number must be a valid Bangladeshi number (e.g., +88017XXXXXXXX or 017XXXXXXXX)';
        },
      },
    });

    // Then, transform the value to normalize it
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;
      
      let phone = value.trim();
      
      // Remove +88 country code if present
      if (phone.startsWith('+88')) {
        phone = phone.substring(3); // Remove '+88'
      }
      
      // Ensure it starts with '01'
      if (phone.startsWith('01')) {
        return phone;
      }
      
      return value; // Return original if format doesn't match
    })(object, propertyName);
  };
}