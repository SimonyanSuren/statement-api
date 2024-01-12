import { Optional } from '@nestjs/common';
import { IsIBAN, IsNotEmpty, IsString, Matches } from 'class-validator';
import Decimal from 'decimal.js';
import { IsDecimalNumber } from '../../common/decorators';

export class StatementDto {
  @IsString()
  @IsNotEmpty()
  public readonly reference: string;

  @IsIBAN()
  public readonly accountNumber: string;

  @IsString()
  @Optional()
  public readonly description?: string;

  @IsDecimalNumber({ maxDecimalPlaces: 3, minimum: 1, maximum: 10_000 })
  public readonly startBalance: Decimal;

  @IsDecimalNumber({ maxDecimalPlaces: 3, minimum: 1, maximum: 10_000 })
  public readonly endBalance: Decimal;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[+\-]?\d*\.?\d+$/)
  public readonly mutation: string;

  public readonly errors: string[] = [];
}
