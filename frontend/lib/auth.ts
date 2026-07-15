'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ccc } from '@ckb-ccc/connector-react';
import { api, operatorSession, type OperatorSession } from '@/lib/api/client';

interface Challenge {
  nonce: string;
  message: string;
  expiresAt: string;
}

/**
 * Sign-In-With-CKB: fetch a challenge, sign it with the connected wallet, POST
 * it back for verification, and persist the returned session. The signature
 * proves operator identity — it authorizes no transaction.
 */
export async function signIn(signer: ccc.Signer): Promise<OperatorSession> {
  const challenge = await api.get<Challenge>('auth/challenge');
  const signature = await signer.signMessage(challenge.message);
  const session = await api.post<OperatorSession>('auth/verify', {
    nonce: challenge.nonce,
    signature: {
      signature: signature.signature,
      identity: signature.identity,
      signType: signature.signType,
    },
  });
  operatorSession.set(session);
  return session;
}

export function signOut(): void {
  operatorSession.clear();
}

/** Session state + sign-in/out helpers for the Header. */
export function useOperatorSession() {
  const [session, setSession] = useState<OperatorSession | null>(null);

  // Hydrate from localStorage on the client only (deferred so first render
  // matches SSR markup — see rebalance page for the same pattern).
  useEffect(() => {
    const timer = window.setTimeout(() => setSession(operatorSession.get()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const doSignIn = useCallback(async (signer: ccc.Signer) => {
    const next = await signIn(signer);
    setSession(next);
    return next;
  }, []);

  const doSignOut = useCallback(() => {
    signOut();
    setSession(null);
  }, []);

  return { session, signIn: doSignIn, signOut: doSignOut };
}
