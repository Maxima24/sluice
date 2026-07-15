import { Injectable } from '@nestjs/common';

interface NonceRecord {
  message: string;
  expiresAt: number;
}

/**
 * Single-use challenge nonces with a TTL. In-memory (single instance is fine for
 * a single-operator node); Redis — already wired via BullMQ — is the durable /
 * multi-instance upgrade if this ever scales horizontally.
 */
@Injectable()
export class NonceStore {
  private readonly store = new Map<string, NonceRecord>();

  put(nonce: string, message: string, ttlMs: number): void {
    this.store.set(nonce, { message, expiresAt: Date.now() + ttlMs });
  }

  /** Returns the stored message and consumes the nonce (single-use); null if missing/expired. */
  consume(nonce: string): string | null {
    this.sweep();
    const record = this.store.get(nonce);
    if (!record) return null;
    this.store.delete(nonce);
    if (record.expiresAt < Date.now()) return null;
    return record.message;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [nonce, record] of this.store) {
      if (record.expiresAt < now) this.store.delete(nonce);
    }
  }
}
