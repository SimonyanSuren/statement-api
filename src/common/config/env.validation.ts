import { Expose, plainToInstance } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

const ENVS = ['development', 'test', 'production'];

class AppConfig {
  // use @Expose decorator to keep only defined properties
  @Expose()
  @IsIn(ENVS)
  NODE_ENV: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  LISTEN_INTERFACE: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  HTTP_PORT: number;
}

export class DatabaseConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;

  @Expose()
  @IsNumber()
  POSTGRES_PORT: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  POSTGRES_SCHEMA: string;
}

export class RedisConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  REDIS_PORT: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  REDIS_PASS: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  REDIS_PREFIX: string;
}

const validate = function (
  envConfig: Record<string, any>
): Record<string, string | number | object> {
  const environmentVariables = plainToInstance(AppConfig, envConfig, {
    // Convert env properties based their type definition in classes
    enableImplicitConversion: true,
    // Strip unnecessary properties from config object based "@Expose" decorator that defined in classes
    excludeExtraneousValues: true,
  });
  const databaseConfig = plainToInstance(DatabaseConfig, envConfig, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });

  const redisConfig = plainToInstance(RedisConfig, envConfig, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });

  const errors = [
    ...validateSync(environmentVariables, { skipMissingProperties: false }),
    ...validateSync(databaseConfig, { skipMissingProperties: false }),
    ...validateSync(redisConfig, { skipMissingProperties: false }),
  ];

  if (errors.length > 0) {
    const eMessages = errors.flatMap((e) => Object.values(e.constraints || {}));

    throw new Error(`Environment config validation error: ${eMessages.join(', ')}`);
  }

  return {
    ...environmentVariables,
    databaseConfig,
    redisConfig,
  };
};

export default validate;
