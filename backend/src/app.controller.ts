import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from './common/decorators/response-message.decorator';

/** Liveness only — no node/DB calls, so platform health checks (Render) pass fast. */
@Controller()
export class AppController {
  @Get('health')
  @ResponseMessage('OK')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
