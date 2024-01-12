import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import constants from '../common/constants';
import { BasicAuthMiddleware } from '../common/middleware';
import { QueueEnum } from './enums';
import { StatementProcessorQueueConsumer } from './statementProcessorQueue.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redisConfig.REDIS_HOST'),
          port: configService.get<number>('redisConfig.REDIS_PORT'),
          password: configService.get<string>('redisConfig.REDIS_PASS'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: QueueEnum.STATEMENT_PROCESSOR_QUEUE,
      prefix: constants.REDIS_PREFIX_DATA_PROCESSOR,
    }),
    PrismaModule,
  ],
  providers: [StatementProcessorQueueConsumer],
  exports: [BullModule],
})
export class QueueModule {
  constructor(
    @InjectQueue(QueueEnum.STATEMENT_PROCESSOR_QUEUE)
    private readonly statementQueue: Queue
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/api/admin/bull-board');

    createBullBoard({
      queues: [new BullMQAdapter(this.statementQueue)],
      serverAdapter,
    });

    consumer
      .apply(BasicAuthMiddleware, serverAdapter.getRouter())
      .forRoutes('/admin/bull-board');
  }
}
