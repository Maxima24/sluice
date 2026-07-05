// JSON-RPC 2.0 envelope + branded scalar aliases for the Fiber node.
// FNN encodes u128/u64 as lowercase 0x-hex STRINGS (rejects redundant leading
// zeros, e.g. "0x0f" is invalid). Keep amounts as strings at this boundary and
// convert with u128FromHex in domain logic — NEVER via JS Number.

export type U128Hex = string; // e.g. "0x2540be400"
export type U64Hex = string;
export type Hash256 = string; // 0x-prefixed 32-byte hex
export type Pubkey = string; // node / peer id, 0x hex

export interface JsonRpcRequest<P = unknown[]> {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: P;
}

export interface JsonRpcErrorBody {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcResponse<R> {
  jsonrpc: '2.0';
  id: number;
  result?: R;
  error?: JsonRpcErrorBody;
}
