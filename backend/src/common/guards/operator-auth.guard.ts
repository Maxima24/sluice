import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AppConfig } from '../../config/app.config';

/** HTTP methods that only read state — always public. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
/** Always-public path prefixes: liveness + the sign-in endpoints themselves. */
const PUBLIC_PREFIXES = ['/health', '/auth'];

/**
 * Gates mutating requests behind operator identity.
 *
 * Reads (`GET`/`HEAD`/`OPTIONS`), `/health`, and `/auth/*` are always public.
 * For mutations the order is:
 *   1. a valid wallet session — `Authorization: Bearer <jwt>`. In open mode
 *      (`AUTH_OPEN=true`) any minted session passes; otherwise `sub` must be an
 *      allowlisted operator key (`OPERATOR_KEYS`);
 *   2. break-glass — `x-dashboard-secret` matching `DASHBOARD_SECRET`;
 *   3. dev default — if open mode is off and neither the allowlist nor the
 *      secret is configured, allow.
 * Otherwise `401`.
 */
@Injectable()
export class OperatorAuthGuard implements CanActivate {
  constructor(
    private readonly config: AppConfig,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(req.method.toUpperCase())) return true;
    if (PUBLIC_PREFIXES.some((p) => req.path === p || req.path.startsWith(`${p}/`))) return true;

    const open = this.config.authOpen;
    const operatorKeys = this.config.operatorKeys;
    const secret = this.config.get('DASHBOARD_SECRET');

    // 1) wallet session (primary) — open mode accepts any verified session
    if ((open || operatorKeys.length > 0) && (await this.hasValidSession(req, open, operatorKeys))) {
      return true;
    }

    // 2) shared-secret break-glass
    if (secret && req.header('x-dashboard-secret') === secret) return true;

    // 3) dev default — nothing configured, allow all
    if (!open && operatorKeys.length === 0 && !secret) return true;

    throw new UnauthorizedException('Operator authentication required');
  }

  private async hasValidSession(req: Request, open: boolean, operatorKeys: string[]): Promise<boolean> {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) return false;

    const secret = this.config.get('AUTH_JWT_SECRET');
    if (!secret) return false;

    try {
      const payload = await this.jwt.verifyAsync<{ sub?: string }>(token, { secret });
      // Open mode: any JWT we minted is enough; closed mode: sub must be allowlisted.
      return !!payload?.sub && (open || operatorKeys.includes(payload.sub));
    } catch {
      return false;
    }
  }
}
