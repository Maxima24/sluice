import { z } from 'zod';

/** CCC SignerSignType string-enum values (kept in sync with @ckb-ccc/core). */
const SIGN_TYPES = ['Unknown', 'BtcEcdsa', 'EvmPersonal', 'JoyId', 'NostrEvent', 'CkbSecp256k1', 'DogeEcdsa'] as const;

/** The `ccc.Signature` shape returned by `signer.signMessage(...)` on the client. */
export const SignatureSchema = z.object({
  signature: z.string().min(1),
  identity: z.string().min(1),
  signType: z.enum(SIGN_TYPES),
});

export const VerifyRequestSchema = z.object({
  nonce: z.string().min(1),
  signature: SignatureSchema,
});

export type SignaturePayload = z.infer<typeof SignatureSchema>;
export type VerifyRequestDto = z.infer<typeof VerifyRequestSchema>;

export interface ChallengeResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface VerifyResponse {
  token: string;
  expiresAt: string;
  /** Cosmetic — the wallet identity that signed in (for display). */
  address: string;
}
