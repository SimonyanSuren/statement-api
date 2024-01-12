import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import constants from '../constants';

export class BasicAuthMiddleware implements NestMiddleware {
  private readonly username = constants.BULL_BOARD_AUTH_USER;

  private readonly password = constants.BULL_BOARD_AUTH_PASS;

  private readonly encodedCredentials = Buffer.from(
    this.username + ':' + this.password
  ).toString('base64');

  use(req: Request, res: Response, next: NextFunction): void {
    const reqCredentials = req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (!reqCredentials || reqCredentials !== this.encodedCredentials) {
      res.setHeader('WWW-Authenticate', 'Basic realm=Bull Board UI, charset="UTF-8"');
      res.setHeader('Cache-Control', 'no-store');
      res.sendStatus(401);
    } else {
      next();
    }
  }
}
