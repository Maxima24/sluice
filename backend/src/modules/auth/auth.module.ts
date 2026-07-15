import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { NonceStore } from './services/nonce.store';

/**
 * Wallet-based operator sign-in. Registers JwtModule globally so the global
 * OperatorAuthGuard can verify session tokens (secret is passed per-call).
 */
@Module({
  imports: [JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [AuthService, NonceStore],
})
export class AuthModule {}
