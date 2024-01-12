import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, MetricsTime } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import csv from 'csvtojson';
import Decimal from 'decimal.js';
import { extname } from 'path';
import xml2js from 'xml2js';
import { PrismaService } from '../prisma/prisma.service';
import { StatementDto } from '../statement/dto/statement.dto';
import { CustomerStatementEntity } from '../statement/entities/customerStatement.entity';
import { FailedStatementEntity } from '../statement/entities/failedStatement.entity';
import { FileType, QueueEnum } from './enums';

@Processor(QueueEnum.STATEMENT_PROCESSOR_QUEUE, {
  metrics: { maxDataPoints: MetricsTime.ONE_MONTH },
  removeOnComplete: { count: 20_000 },
})
export class StatementProcessorQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(StatementProcessorQueueConsumer.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  @OnWorkerEvent('completed')
  public async onWorkerCompleted(job: Job<unknown>): Promise<void> {
    this.logger.log(`Completed job: [${job.queueName}]:[${job.name}]:[${job.id}]`);
    await job.updateProgress(100);
  }

  @OnWorkerEvent('failed')
  public async onWorkerFailed(job: Job<unknown>, err: Error): Promise<void> {
    this.logger.error(
      `Failed job: [${job.queueName}]:[${job.name}], error message: "${err.message}" .`
    );
  }

  @OnWorkerEvent('error')
  public async onWorkerError(err: Error): Promise<void> {
    this.logger.error(`Worker error: error message: "${err.message}" .`);
  }

  @OnQueueEvent('error')
  public async onQueueError(err: Error): Promise<void> {
    this.logger.error(`Queue error: error message: "${err.message}" .`);
  }

  public async process(job: Job<Express.Multer.File>): Promise<void> {
    try {
      const file = job.data;

      if (!file || !file.originalname) throw new Error('File required.');

      const { originalname, buffer } = file;
      const extension = extname(originalname).split('.')[1] as FileType;
      const stringFromBuffer = Buffer.from(buffer).toString('utf8');
      let result;

      switch (extension) {
        // Parse csv
        case FileType.CSV:
          result = await csv({
            headers: [
              'reference',
              'accountNumber',
              'description',
              'startBalance',
              'mutation',
              'endBalance',
            ],
            colParser: {
              reference: 'string',
              startBalance: 'number',
              endBalance: 'number',
              mutation: 'string',
            },
            checkType: true,
            trim: true,
          }).fromString(stringFromBuffer);

          break;

        // Parse xml
        case FileType.XML:
          const parsedData = await xml2js.parseStringPromise(stringFromBuffer, {
            trim: true,
            explicitArray: false,
            explicitRoot: false,
            attrkey: 'reference',
            mergeAttrs: true,
            valueProcessors: [
              (v: string, n: string) => {
                if (['startBalance', 'endBalance'].includes(n)) {
                  return parseFloat(v);
                }
                return v;
              },
            ],
          });

          result = parsedData.record;

          break;
        // Make exhaustive check to prevent error in development
        default:
          const exhaustiveCheck: never = extension;
          throw new Error(`Unknown job type: ${exhaustiveCheck}`);
      }

      // Validate statements
      const { validatedStatements, failedStatements } =
        await this.validateStatement(result);

      // Save into db
      for (const statement of validatedStatements) {
        try {
          await this.prisma.customerStatement.create({
            data: this.mapToStatementEntity(statement),
          });
        } catch (err: any) {
          // If error code equals P202 that means unique constraint error,
          // push to failed array, append error message
          if (err?.code === 'P2002') {
            statement.errors.push('Duplicate transaction reference.');
            failedStatements.push(statement);
          }
        }
      }
      // Save failed to db for report data
      await this.prisma.failedStatement.createMany({
        data: this.mapToFailedStatementEntity(failedStatements),
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  //@TODO Create separate validation service
  private async validateStatement(statements: StatementDto[]): Promise<{
    validatedStatements: StatementDto[];
    failedStatements: StatementDto[];
  }> {
    try {
      const validatedStatements: StatementDto[] = [];
      const failedStatements: StatementDto[] = [];

      for (const statement of statements) {
        const target = plainToInstance(StatementDto, statement);
        const errors = await validate(target);

        // In case of error push into failed array, continue
        if (errors.length > 0) {
          const errorMessages = errors.flatMap((e) => Object.values(e.constraints || {}));

          target.errors.push(...errorMessages);
          failedStatements.push(target);

          continue;
        }

        //  Check end balance correctness with transaction data
        const isValid = await this.validateEndBalance(target);

        // if valid push valid statements array
        if (isValid) {
          validatedStatements.push(target);
        } else {
          failedStatements.push(target);
          target.errors.push(
            'The final balance value does not match the transaction data.'
          );
        }
      }

      return { validatedStatements, failedStatements };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async validateEndBalance(statement: StatementDto): Promise<boolean> {
    const { startBalance, endBalance, mutation } = statement;

    // Using decimal.js to prevent known numeric operations issues in javascript
    const op = mutation.charAt(0);
    const dMutation = new Decimal(mutation).abs();

    let checkEndBalance: Decimal | null = null;

    switch (op) {
      case '+':
        checkEndBalance = startBalance.add(dMutation);

        break;
      case '-':
        checkEndBalance = startBalance.sub(dMutation);

        break;
      default:
        break;
    }

    return !!checkEndBalance && checkEndBalance.eq(endBalance);
  }

  private mapToStatementEntity(statement: StatementDto): CustomerStatementEntity {
    return new CustomerStatementEntity({
      txnReference: statement.reference,
      accountNumber: statement.accountNumber,
      mutation: statement.mutation,
      startBalance: statement.startBalance,
      endBalance: statement.endBalance,
      description: statement.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private mapToFailedStatementEntity(
    statements: StatementDto[]
  ): FailedStatementEntity[] {
    return statements.map(
      (statement) =>
        new FailedStatementEntity({
          txnReference: statement.reference,
          description: statement.errors.join(', '),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    );
  }
}
