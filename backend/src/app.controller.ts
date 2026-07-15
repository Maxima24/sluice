import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from './common/decorators/response-message.decorator';

/** Liveness only — no node/DB calls, so platform health checks (Render) pass fast. */
@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Liveness check' })
  @ResponseMessage('OK')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
