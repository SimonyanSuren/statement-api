import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { StatementController } from './statement.controller';
import { StatementService } from './statement.service';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [StatementController],
  providers: [StatementService],
})
export class StatementModule {}
