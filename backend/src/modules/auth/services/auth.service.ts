import { randomBytes } from 'node:crypto';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Signer } from '@ckb-ccc/core';
import { AppConfig } from '../../../config/app.config';
import { NonceStore } from './nonce.store';
import type { ChallengeResponse, SignaturePayload, VerifyResponse } from '../dto/auth.dto';

const CHALLENGE_TTL_MS = 5 * 60_000; // 5 minutes to sign

/**
 * Sign-In-With-CKB. Issues a nonce challenge, verifies the wallet signature with
 * CCC (`@ckb-ccc/core` — server-side, any wallet type incl. JoyID), checks the
 * signer identity against the operator allowlist, and mints a session JWT. The
 * wallet only proves identity; it never signs node operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly config: AppConfig,
    private readonly jwt: JwtService,
    private readonly nonces: NonceStore,
  ) {}

  challenge(): ChallengeResponse {
    const nonce = randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS);
    const message = [
      'Fiber Liquidity Layer — Operator Sign-In',
      '',
      'Sign this message to prove you control this wallet. It authorizes no transaction and moves no funds.',
      '',
      'Domain: sluice.drreamer.digital',
      `Nonce: ${nonce}`,
      `Issued At: ${now.toISOString()}`,
      `Expires At: ${expiresAt.toISOString()}`,
    ].join('\n');
    this.nonces.put(nonce, message, CHALLENGE_TTL_MS);
    return { nonce, message, expiresAt: expiresAt.toISOString() };
  }

  async verify(nonce: string, signature: SignaturePayload): Promise<VerifyResponse> {
    // Re-derive the exact signed message from our store (single-use) so the
    // client can't substitute a different payload.
    const message = this.nonces.consume(nonce);
    if (!message) {
      throw new UnauthorizedException('Challenge expired or already used — request a new one');
    }

    const verified = await Signer.verifyMessage(
      message,
      signature as Parameters<typeof Signer.verifyMessage>[1],
    ).catch(() => false);
    if (!verified) {
      throw new UnauthorizedException('Signature verification failed');
    }

    const canonicalKey = `${signature.signType}:${signature.identity}`;
    // Open mode (demo) accepts any verified wallet; closed mode enforces the allowlist.
    if (!this.config.authOpen && !this.config.operatorKeys.includes(canonicalKey)) {
      // Echo the key so the operator can allowlist it on first-time setup.
      throw new ForbiddenException(`Wallet not authorized. Operator key: ${canonicalKey}`);
    }

    const ttlHours = this.config.get('AUTH_SESSION_TTL_H');
    const token = await this.jwt.signAsync(
      { sub: canonicalKey },
      { secret: this.jwtSecret(), expiresIn: `${ttlHours}h` },
    );
    const expiresAt = new Date(Date.now() + ttlHours * 3_600_000).toISOString();
    return { token, expiresAt, address: signature.identity };
  }

  private jwtSecret(): string {
    const secret = this.config.get('AUTH_JWT_SECRET');
    if (!secret) {
      // Guarded by env.schema (required when OPERATOR_KEYS is set), but be explicit.
      throw new UnauthorizedException('Wallet sign-in is not configured');
    }
    return secret;
  }
}
