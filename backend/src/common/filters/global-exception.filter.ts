import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppConfig } from '../../config/app.config';

/**
 * Emits the same `{ statusCode, message, data }` envelope on error as the
 * success interceptor, so the frontend always reads one shape. In non-prod it
 * appends an `error` detail; in prod it hides 5xx internals.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly config: AppConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let detail: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        message = (b.message as string) ?? exception.message;
        detail = b;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      detail = { name: exception.name };
    }

    if (status >= 500) {
      this.logger.error(message, exception instanceof Error ? exception.stack : undefined);
      if (this.config.isProd) message = 'Internal server error';
    }

    res.status(status).json({
      statusCode: status,
      message,
      data: null,
      ...(this.config.isProd ? {} : { error: detail }),
    });
  }
}
