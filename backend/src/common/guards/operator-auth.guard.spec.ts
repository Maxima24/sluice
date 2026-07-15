import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { OperatorAuthGuard } from './operator-auth.guard';

const OPERATOR_KEY = 'JoyId:abc';

function ctx(method: string, path: string, headers: Record<string, string> = {}) {
  const req = {
    method,
    path,
    header: (name: string) => headers[name.toLowerCase()],
  };
  return { switchToHttp: () => ({ getRequest: () => req }) } as never;
}

function guardWith(opts: {
  operatorKeys?: string[];
  secret?: string;
  jwtSub?: string;
  jwtThrows?: boolean;
  open?: boolean;
}) {
  const config = {
    operatorKeys: opts.operatorKeys ?? [],
    authOpen: opts.open ?? false,
    get: vi.fn((k: string) =>
      k === 'DASHBOARD_SECRET'
        ? opts.secret
        : k === 'AUTH_JWT_SECRET'
          ? opts.operatorKeys?.length || opts.open
            ? 'hmac'
            : undefined
          : undefined,
    ),
  };
  const jwt = {
    verifyAsync: vi.fn(async () => {
      if (opts.jwtThrows) throw new Error('bad token');
      return { sub: opts.jwtSub };
    }),
  };
  return new OperatorAuthGuard(config as never, jwt as never);
}

describe('OperatorAuthGuard', () => {
  it('always allows reads and /auth/*', async () => {
    const g = guardWith({ operatorKeys: [OPERATOR_KEY], secret: 'x' });
    expect(await g.canActivate(ctx('GET', '/channels/health'))).toBe(true);
    expect(await g.canActivate(ctx('HEAD', '/node/info'))).toBe(true);
    expect(await g.canActivate(ctx('POST', '/auth/verify'))).toBe(true);
    expect(await g.canActivate(ctx('GET', '/health'))).toBe(true);
  });

  it('allows a mutation with a valid Bearer session for an allowlisted key', async () => {
    const g = guardWith({ operatorKeys: [OPERATOR_KEY], jwtSub: OPERATOR_KEY });
    expect(
      await g.canActivate(ctx('POST', '/rebalance', { authorization: 'Bearer good.jwt' })),
    ).toBe(true);
  });

  it('rejects a mutation whose token sub is not allowlisted', async () => {
    const g = guardWith({ operatorKeys: [OPERATOR_KEY], jwtSub: 'JoyId:someone-else' });
    await expect(
      g.canActivate(ctx('POST', '/rebalance', { authorization: 'Bearer good.jwt' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a mutation with an invalid/expired token', async () => {
    const g = guardWith({ operatorKeys: [OPERATOR_KEY], jwtThrows: true });
    await expect(
      g.canActivate(ctx('POST', '/rebalance', { authorization: 'Bearer expired' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('honours the x-dashboard-secret break-glass fallback', async () => {
    const g = guardWith({ operatorKeys: [], secret: 'sekret' });
    expect(
      await g.canActivate(ctx('POST', '/rebalance', { 'x-dashboard-secret': 'sekret' })),
    ).toBe(true);
    await expect(
      g.canActivate(ctx('POST', '/rebalance', { 'x-dashboard-secret': 'wrong' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('allows all mutations when nothing is configured (dev default)', async () => {
    const g = guardWith({});
    expect(await g.canActivate(ctx('POST', '/rebalance'))).toBe(true);
  });

  it('open mode (AUTH_OPEN) allows any valid session regardless of allowlist', async () => {
    const g = guardWith({ open: true, jwtSub: 'JoyId:whoever-just-signed-in' });
    expect(
      await g.canActivate(ctx('POST', '/rebalance', { authorization: 'Bearer good.jwt' })),
    ).toBe(true);
  });

  it('open mode still requires a valid session (no anonymous mutations)', async () => {
    const g = guardWith({ open: true });
    await expect(g.canActivate(ctx('POST', '/rebalance'))).rejects.toThrow(UnauthorizedException);
  });
});
