import { HttpException, HttpStatus } from '@nestjs/common';

/** Raised by ZodValidationPipe when a request DTO fails validation. */
export class ValidationError extends HttpException {
  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super({ code: 'VALIDATION_ERROR', message, details }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
