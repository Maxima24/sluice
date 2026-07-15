import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

// u128 amounts reach 39 digits; raise decimal.js arithmetic precision so any
// Decimal math (reconciliation) never silently rounds. (Amount math stays BigInt.)
Prisma.Decimal.set({ precision: 60 });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app)); // raw ws (matches the frontend's native WebSocket)

  const config = app.get(AppConfig);
  const logger = new Logger('Bootstrap');

  app.use(helmet({ contentSecurityPolicy: false })); // CSP off so Swagger UI assets load
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.useGlobalFilters(new GlobalExceptionFilter(config));
  app.enableShutdownHooks();

  // OpenAPI / Swagger UI at GET /docs (+ /docs-json). Reads are public under the guard.
  const openapi = new DocumentBuilder()
    .setTitle('Fiber Liquidity Layer API')
    .setDescription(
      'Operability API for a CKB Fiber Network node — liquidity visibility, "can I pay?" probe, ' +
        'self-healing rebalancing, double-entry ledger, and Sign-In-With-CKB operator auth. ' +
        'Reads are public; mutations require a wallet session (Bearer).',
    )
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'operator-session')
    .addTag('health', 'Liveness')
    .addTag('auth', 'Sign-In-With-CKB')
    .addTag('node', 'Node identity, peers, graph')
    .addTag('channels', 'Live channel liquidity')
    .addTag('routing', '"Can I pay?" probe')
    .addTag('rebalance', 'Circular rebalancing')
    .addTag('ledger', 'Double-entry audit ledger')
    .addTag('reconciliation', 'Snapshot vs node drift')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, openapi), {
    customSiteTitle: 'Fiber Liquidity Layer API',
  });

  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
  logger.log(`Listening on :${port} (${config.get('NODE_ENV')})`);
}

void bootstrap();
