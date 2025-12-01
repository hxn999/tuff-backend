import { 
    registerDecorator, 
    ValidationOptions, 
    ValidationArguments 
  } from 'class-validator';
  
  export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isEmailOrPhone',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            const obj = args.object as any;
            return !!(obj.email || obj.phone);
          },
          defaultMessage(args: ValidationArguments) {
            return 'Either email or phone must be provided';
          }
        }
      });
    };
  }