import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

// u128 amounts reach 39 digits; raise decimal.js arithmetic precision so any
// Decimal math (reconciliation) never silently rounds. (Amount math stays BigInt.)
Prisma.Decimal.set({ precision: 60 });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(AppConfig);
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.useGlobalFilters(new GlobalExceptionFilter(config));
  app.enableShutdownHooks();

  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
  logger.log(`Listening on :${port} (${config.get('NODE_ENV')})`);
}

void bootstrap();
