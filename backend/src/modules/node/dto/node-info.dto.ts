/** Domain-shaped node identity for the frontend (raw RPC types never leak out). */
export interface NodeInfoDto {
  version: string;
  commitHash?: string;
  pubkey: string;
  nodeName?: string | null;
  chainHash: string;
  addresses: string[];
}
