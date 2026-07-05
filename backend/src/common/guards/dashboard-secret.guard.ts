import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AppConfig } from '../../config/app.config';

/**
 * Single shared-secret gate that replaces the inherited auth model.
 * - Disabled (allow-all) when DASHBOARD_SECRET is unset — the dev default.
 * - When set, every request must send `X-Dashboard-Secret: <value>`.
 * - `/health` is always public so platform health checks (Render) pass.
 */
@Injectable()
export class DashboardSecretGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get('DASHBOARD_SECRET');
    if (!secret) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (req.path === '/health') return true;

    const provided = req.header('x-dashboard-secret');
    if (provided !== secret) {
      throw new UnauthorizedException('Invalid or missing dashboard secret');
    }
    return true;
  }
}
