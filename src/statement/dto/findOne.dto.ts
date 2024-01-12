import { IsNumber } from 'class-validator';

export class FindOneDto {
  @IsNumber()
  id?: number;
}
