import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';

export abstract class GenericResponse<T> {
  @ApiResponseProperty()
  success: boolean;

  @ApiProperty()
  payload: T | T[];

  @ApiPropertyOptional()
  message?: string;
}
