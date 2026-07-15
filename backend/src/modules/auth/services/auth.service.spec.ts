import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Signer } from '@ckb-ccc/core';
import { AuthService } from './auth.service';
import type { SignaturePayload } from '../dto/auth.dto';

vi.mock('@ckb-ccc/core', () => ({ Signer: { verifyMessage: vi.fn() } }));
const verifyMessage = Signer.verifyMessage as unknown as Mock;

const OPERATOR_KEY = 'JoyId:{"publicKey":"0xabc","keyType":"main_session_key"}';
const signature: SignaturePayload = {
  signature: '0xsig',
  identity: '{"publicKey":"0xabc","keyType":"main_session_key"}',
  signType: 'JoyId',
};

function setup(operatorKeys: string[] = [OPERATOR_KEY], open = false) {
  const nonces = { put: vi.fn(), consume: vi.fn().mockReturnValue('the-signed-message') };
  const jwt = { signAsync: vi.fn().mockResolvedValue('jwt.token.here') };
  const config = {
    operatorKeys,
    authOpen: open,
    get: vi.fn((k: string) => (k === 'AUTH_JWT_SECRET' ? 'hmac-secret' : k === 'AUTH_SESSION_TTL_H' ? 12 : undefined)),
  };
  const service = new AuthService(config as never, jwt as never, nonces as never);
  return { service, nonces, jwt, config };
}

beforeEach(() => verifyMessage.mockReset());

describe('AuthService.challenge', () => {
  it('issues a stored single-use nonce embedded in the message', () => {
    const { service, nonces } = setup();
    const res = service.challenge();
    expect(res.nonce).toMatch(/^[0-9a-f]{32}$/);
    expect(res.message).toContain(`Nonce: ${res.nonce}`);
    expect(res.message).toContain('Domain: sluice.drreamer.digital');
    expect(nonces.put).toHaveBeenCalledWith(res.nonce, res.message, expect.any(Number));
  });
});

describe('AuthService.verify', () => {
  it('mints a JWT for a valid signature from an allowlisted operator key', async () => {
    const { service, jwt } = setup();
    verifyMessage.mockResolvedValue(true);

    const res = await service.verify('nonce-1', signature);

    expect(verifyMessage).toHaveBeenCalledWith('the-signed-message', signature);
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: OPERATOR_KEY },
      { secret: 'hmac-secret', expiresIn: '12h' },
    );
    expect(res.token).toBe('jwt.token.here');
    expect(res.address).toBe(signature.identity);
  });

  it('rejects a valid signature from a non-allowlisted wallet, echoing the key', async () => {
    const { service, jwt } = setup([]); // empty allowlist
    verifyMessage.mockResolvedValue(true);

    await expect(service.verify('nonce-1', signature)).rejects.toThrow(ForbiddenException);
    await expect(service.verify('nonce-1', signature)).rejects.toThrow(OPERATOR_KEY);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('rejects a bad signature', async () => {
    const { service } = setup();
    verifyMessage.mockResolvedValue(false);
    await expect(service.verify('nonce-1', signature)).rejects.toThrow(UnauthorizedException);
  });

  it('mints a JWT for ANY verified wallet in open mode (allowlist skipped)', async () => {
    const { service, jwt } = setup([], true); // empty allowlist, AUTH_OPEN=true
    verifyMessage.mockResolvedValue(true);

    const dto = await service.verify('nonce-1', signature);

    expect(dto.token).toBe('jwt.token.here');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: OPERATOR_KEY }, expect.anything());
  });

  it('rejects an expired / already-used nonce (no verification attempted)', async () => {
    const { service, nonces } = setup();
    nonces.consume.mockReturnValue(null);
    await expect(service.verify('stale', signature)).rejects.toThrow(/expired or already used/);
    expect(verifyMessage).not.toHaveBeenCalled();
  });
});
