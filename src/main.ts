import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ApplicationModule } from './app.module';
import { BaseExceptionFilter } from './common/filters/base-exception.filter';
import { createDocument } from './docs/swagger';

const bootstrap = async (): Promise<void> => {
  try {
    const app = await NestFactory.create<NestExpressApplication>(ApplicationModule, {
      // Enable cors, define configs
      cors: {
        origin: true,
        optionsSuccessStatus: 204,
        methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true,
      },
    });

    // App configuration
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // Add security
    app.use(helmet());

    // Add compression
    app.use(compression());

    // Add cookie parser
    app.use(cookieParser());

    // Define global exception filters
    app.useGlobalFilters(new BaseExceptionFilter());

    // Define global validators
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        enableDebugMessages: true,
        forbidUnknownValues: true,
        transform: true,
        validationError: {
          target: false,
          value: true,
        },
      })
    );

    // Enable Swagger
    createDocument(app);

    const configService = app.get<ConfigService>(ConfigService);
    const logger = new Logger('Bootstrap');

    // Start application
    await app.listen(
      configService.get<number>('HTTP_PORT', 9090),
      configService.get<string>('LISTEN_INTERFACE', '0.0.0.0')
    );

    logger.log(`Application is running on: ${await app.getUrl()}`);

    // @TODO Handle gracefully shutdown
  } catch (err) {
    console.error('Error while bootstrapping main app: ', err);
    throw err;
  }
};

bootstrap().catch((err) => {
  console.error('Error while bootstrapping app: ', err);
  throw err;
  //process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});
