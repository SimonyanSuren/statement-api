import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, statusCode } = req;
    const ip = req.get('X-Forwarded-For') || req.get('X-Real-Ip') || req.ip;
    const userAgent = req.get('User-Agent') || '';
    const contentLength = res.get('Content-Length');

    const logMessage = `METHOD: ${method}, API: ${originalUrl}, Request IP: ${ip}, Agent: ${userAgent}, Status: ${statusCode}${
      contentLength ? ', Content Length: '.concat(contentLength) : ''
    }`;

    this.logger.debug(logMessage);

    next();
  }
}
