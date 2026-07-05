import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../exceptions/validation.error';

/**
 * Per-route request-body validation via Zod (mirrors the reference's pipe).
 * Usage: `@UsePipes(new ZodValidationPipe(SomeSchema))`. This is why the global
 * class-validator ValidationPipe was dropped from main.ts — our DTOs are Zod.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new ValidationError('Request validation failed', result.error.flatten());
    }
    return result.data;
  }
}
