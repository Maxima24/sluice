import { Body, Controller, Get, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { VerifyRequestSchema, type VerifyRequestDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('challenge')
  @ResponseMessage('Sign-in challenge')
  challenge() {
    return this.service.challenge();
  }

  @Post('verify')
  @HttpCode(200)
  @ResponseMessage('Signed in')
  @UsePipes(new ZodValidationPipe(VerifyRequestSchema))
  verify(@Body() body: VerifyRequestDto) {
    return this.service.verify(body.nonce, body.signature);
  }
}
