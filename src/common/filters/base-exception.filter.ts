import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { IErrorResponse } from './errorResponse.interface';

@Catch(HttpException)
export class BaseExceptionFilter<T extends HttpException> implements ExceptionFilter<T> {
  private readonly logger = new Logger(BaseExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(exception);

    const exceptionResponse: string | Record<string, any> = exception.getResponse();
    const statusCode = exception.getStatus();
    const message: string | string[] =
      typeof exceptionResponse === 'object'
        ? exceptionResponse.message
        : exceptionResponse;
    const error = exception?.name
      ? exception.name.replace(/([a-z])([A-Z])/g, '$1 $2')
      : 'Unknown error';

    const errorResponse: IErrorResponse = {
      statusCode,
      message,
      error,
    };

    response.status(statusCode).json(errorResponse);
  }
}
