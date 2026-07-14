import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AppConfig } from '../../config/app.config';

/** HTTP methods that only read state — always public. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Single shared-secret gate that replaces the inherited auth model.
 * - Disabled (allow-all) when DASHBOARD_SECRET is unset — the dev default.
 * - When set, only *mutating* requests (POST/PUT/PATCH/DELETE) must send
 *   `X-Dashboard-Secret: <value>`. Reads stay public so the dashboard is
 *   viewable by anyone while money-moving endpoints (e.g. POST /rebalance)
 *   require the operator secret. The frontend attaches the header from a
 *   locally-stored secret the operator enters — it is never baked into the
 *   public bundle.
 * - `/health` is always public so platform health checks pass.
 */
@Injectable()
export class DashboardSecretGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get('DASHBOARD_SECRET');
    if (!secret) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (req.path === '/health') return true;
    if (SAFE_METHODS.has(req.method.toUpperCase())) return true;

    const provided = req.header('x-dashboard-secret');
    if (provided !== secret) {
      throw new UnauthorizedException('Invalid or missing dashboard secret');
    }
    return true;
  }
}
