import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Raised when a Fiber node RPC call fails (transport error or a JSON-RPC
 * `error` in the body). Surfaces as 502 Bad Gateway so an unreachable/erroring
 * node is distinguishable from a bug in our code (500).
 */
export class FiberRpcError extends HttpException {
  constructor(
    readonly method: string,
    readonly rpcCode: number | string,
    detail: string,
    readonly rpcData?: unknown,
  ) {
    super(
      {
        code: 'FIBER_RPC_ERROR',
        message: `Fiber RPC "${method}" failed: ${detail}`,
        method,
        rpcCode,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
