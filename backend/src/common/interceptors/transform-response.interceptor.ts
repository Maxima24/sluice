import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

/** The one response shape the frontend consumes. */
export interface ResponseEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<ResponseEnvelope<T>> {
    const res = ctx.switchToHttp().getResponse<{ statusCode: number }>();
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? 'OK';
    return next.handle().pipe(
      map((data) => ({ statusCode: res.statusCode, message, data })),
    );
  }
}
