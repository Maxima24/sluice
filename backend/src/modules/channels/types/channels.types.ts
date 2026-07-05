import type { SnapshotSource } from '@prisma/client';

/**
 * The plain (Prisma-free) shape the mapper emits for persistence. The repository
 * turns the decimal strings into `Prisma.Decimal` — keeping the mapper pure.
 */
export interface SnapshotWriteInput {
  channelId: string;
  peerPubkey: string;
  stateName: string;
  localBalance: string; // decimal
  remoteBalance: string; // decimal
  capacity: string; // decimal
  isUdt: boolean;
  fundingUdtTypeScript: { codeHash: string; hashType: string; args: string } | null;
  source: SnapshotSource;
}
