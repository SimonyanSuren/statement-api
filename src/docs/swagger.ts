import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_CONFIG } from './swagger.config';
import basicAuth from 'express-basic-auth';

const SWAGGER_ENVS = ['local', 'development', 'production'];

export function createDocument(app: INestApplication): void {
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)
    .addSecurityRequirements('cookieAuth')
    .addCookieAuth(
      'cookieAuth',
      {
        type: 'http',
        name: 'Authorization',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'cookieAuth'
    );

  for (const tag of SWAGGER_CONFIG.tags) {
    builder.addTag(tag);
  }

  const options = builder.build();
  const { username, password }: any = {
    username: process.env.SWAGGER_USERNAME,
    password: process.env.SWAGGER_PASSWORD,
  };

  //@TODO Enable auth in production mode
  if (true) {
    //app.use(
    //'/docs'
    //basicAuth({
    //  challenge: true,
    //  users: {
    //    [username]: password,
    //  },
    //})
    //);
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
}
