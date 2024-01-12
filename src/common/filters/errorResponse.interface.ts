import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export abstract class IErrorResponse {
  @ApiProperty({
    type: Number,
    enum: HttpStatus,
    example: [400, 403, 404, 500],
  })
  statusCode: HttpStatus;

  @ApiProperty({
    anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiPropertyOptional()
  error?: string;
}
