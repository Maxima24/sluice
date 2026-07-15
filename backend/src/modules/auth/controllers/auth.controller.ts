import { Body, Controller, Get, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { VerifyRequestSchema, type VerifyRequestDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('challenge')
  @ApiOperation({ summary: 'Get a single-use sign-in challenge (nonce + message)' })
  @ResponseMessage('Sign-in challenge')
  challenge() {
    return this.service.challenge();
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify a wallet signature (CCC) → session JWT' })
  @ApiBody({
    schema: {
      example: {
        nonce: '<nonce from /auth/challenge>',
        signature: { signature: '0x…', identity: '{"publicKey":"0x…"}', signType: 'JoyId' },
      },
    },
  })
  @ResponseMessage('Signed in')
  @UsePipes(new ZodValidationPipe(VerifyRequestSchema))
  verify(@Body() body: VerifyRequestDto) {
    return this.service.verify(body.nonce, body.signature);
  }
}
