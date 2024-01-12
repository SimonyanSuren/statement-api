import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StatementQueueJobType } from '../queue/enums';
import { QueueEnum } from '../queue/enums/queue.enum';
import { CustomerStatementEntity } from './entities/customerStatement.entity';
import { FailedStatementEntity } from './entities/failedStatement.entity';

@Injectable()
export class StatementService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QueueEnum.STATEMENT_PROCESSOR_QUEUE)
    private readonly statementQueue: Queue
  ) {}

  public async operateStatementFile(file: Express.Multer.File): Promise<void> {
    await this.statementQueue.add(StatementQueueJobType.OPERATE_FILE, file);
  }

  public async getStatements(id?: number): Promise<CustomerStatementEntity[]> {
    const options: Prisma.CustomerStatementFindManyArgs = {};
    if (id) options.where = { id };
    return this.prisma.customerStatement.findMany(options);
  }

  public async getFailedStatements(id?: number): Promise<FailedStatementEntity[]> {
    const options: Prisma.FailedStatementFindManyArgs = {};
    if (id) options.where = { id };
    return this.prisma.failedStatement.findMany(options);
  }
}
