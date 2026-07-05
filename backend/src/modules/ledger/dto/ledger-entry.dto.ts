export interface LedgerEntryDto {
  id: string;
  rebalanceJobId: string;
  channelId: string;
  direction: 'OUTBOUND' | 'INBOUND';
  entryType: 'PRINCIPAL' | 'FEE';
  amount: string; // decimal
  createdAt: string;
}
