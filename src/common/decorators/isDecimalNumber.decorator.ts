import {
  ValidationArguments,
  ValidationOptions,
  isNumber,
  max,
  min,
  registerDecorator,
} from 'class-validator';
import Decimal from 'decimal.js';

/**
 * Options to be passed to IsDecimalNumber decorator.
 */
interface IsDecimalOptions {
  /**
   * maximum decimal places
   * @defaultValue 2
   */
  maxDecimalPlaces?: number;
  /**
   * minimum point
   * @defaultValue 1
   */
  minimum?: number;
  /**
   * maximum point
   * @defaultValue 10000
   */
  maximum?: number;
}

export function IsDecimalNumber(
  options?: IsDecimalOptions,
  validationOptions?: ValidationOptions
) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isDecimalNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          // Assign  default values for IsDecimalOptions
          const { maxDecimalPlaces = 2, minimum = 1, maximum = 10_000 } = options || {};

          const isValid =
            isNumber(value, { maxDecimalPlaces }) &&
            min(value, minimum) &&
            max(value, maximum);

          if (!isValid) return false;

          args.object[args.property] = new Decimal(value);

          return true;
        },
        defaultMessage() {
          const { maxDecimalPlaces = 2, minimum = 1, maximum = 10_000 } = options || {};
          return `$property must be valid decimal number(min:${minimum}, max:${maximum}) with maximum ${maxDecimalPlaces} decimal places.`;
        },
      },
    });
  };
}
