import { ApiProperty } from '@nestjs/swagger';
import { FailedStatement } from '@prisma/client';

export class FailedStatementEntity implements FailedStatement {
  constructor(partial: Partial<FailedStatementEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  txnReference: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
