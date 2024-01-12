import { ApiProperty } from '@nestjs/swagger';
import { CustomerStatement, Prisma } from '@prisma/client';

export class CustomerStatementEntity implements CustomerStatement {
  constructor(partial: Partial<CustomerStatementEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  txnReference: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  mutation: string;

  @ApiProperty()
  startBalance: Prisma.Decimal;

  @ApiProperty()
  endBalance: Prisma.Decimal;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
