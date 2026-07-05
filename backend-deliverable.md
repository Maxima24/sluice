# Backend Deliverable — Next Steps (Build Order 4–7)

Runbook for the remaining **backend** work on the Fiber Liquidity Layer. Each step is
built as a bounded context in the **canonical layout** and verified **against the real
testnet node** (not a mock).

## Status

| Step | Scope | State |
|------|-------|-------|
| 0 | Testnet FNN node + infra (Docker) | ✅ live (`node_info` verified via socat proxy on `:8299`) |
| 1 | Repo + `FiberRpcClient` (`node` context) | ✅ live (`/node/info\|channels\|peers\|graph`) |
| 2 | Prisma schema + `channels` snapshots/health | ✅ live (`/channels/health`, `source:'live'`) |
| 3 | Health dashboard | frontend (base scaffolded; bars land in Step 3) |
| **4** | **Live push (realtime)** | **next** |
| 5 | "Can I pay?" probe (routing) | pending |
| 6 | Rebalance engine (worker + ledger) | pending |
| 7 | Reconciliation | pending |

## Conventions every step must honor

- **Canonical module layout** (`src/modules/<ctx>/`): `controllers/ services/ repositories/ mappers/ dto/ types/ + <ctx>.module.ts + <ctx>.public.ts`. No logic in controllers; **no data-source access outside repositories**; cross-context calls go through the other context's `*_SERVICE` token (e.g. `NODE_SERVICE`, `CHANNELS_SERVICE`), never the class.
- **All node RPC via `FiberRpcClient`** (`FIBER_RPC` port). Add new methods there with typed inputs/outputs; if the running node's shape differs, adapt the adapter — never work around it elsewhere.
- **Amounts are u128 hex strings** → `BigInt` for math (`u128FromHex`), decimal string for persistence (`Decimal @db.Decimal(40,0)`). **Never `Number()`.**
- **Envelope** `{ statusCode, message, data }` via the interceptor; `@ResponseMessage('…')` per route; node failures surface as `FiberRpcError` (502).
- **Money-touching paths** (Step 6): idempotency key + `Serializable` transaction + row lock; **double-entry, balanced** ledger. Our DB is a record — the **node is always the source of truth**.

---

## Step 4 — Live push (realtime gateway + node subscription + transform)

**Goal.** Bars update on their own. Backend is the transform layer between two WebSockets that must never be conflated: **node→backend** (FNN's own subscription) and **backend→frontend** (our push).

**New context — `realtime`** (+ extend `FiberRpcClient` for the node WS):
```
infrastructure/fiber-rpc/fiber-subscription.service.ts   # opens FIBER_WS_URL, calls subscribe_store_changes
modules/realtime/
  realtime.module.ts  realtime.public.ts
  gateways/realtime.gateway.ts        # @WebSocketGateway — broadcasts balance-changed
  services/liquidity-poller.service.ts# @Interval(POLL_INTERVAL_MS) list_channels backstop
  services/balance-transform.service.ts# node event/poll -> re-read channels -> diff snapshot -> emit
  dto/balance-changed.dto.ts
```

**RPC / node facts (verified).**
- FNN exposes exactly **one** subscription: `subscribe_store_changes` (jsonrpsee pub/sub on the same `FIBER_WS_URL` port) → `store_changes` notifications, keyed by `payment_hash` (`PutPaymentSession` / `PutAttempt` / `PutCkbInvoiceStatus` / `PutPreimage`).
- **FNN emits NO channel-balance events.** So: the **interval poll of `list_channels` is the PRIMARY source** of channel-state truth; the node WS is a *payment-liveness trigger* that causes an immediate re-read of affected channels.

**Key logic.**
1. `FiberSubscriptionService` (add to `FiberRpcClient` surface): connect `FIBER_WS_URL`, `subscribe_store_changes`, reconnect w/ backoff, re-subscribe on reconnect; on each `store_changes`, hand the `payment_hash` to `BalanceTransformService`.
2. `LiquidityPollerService`: every `POLL_INTERVAL_MS`, call `CHANNELS_SERVICE.getHealth()` (already does change-detection + snapshot writes) and emit `balance-changed` for any channel whose balance/state changed vs the last emitted value.
3. `BalanceTransformService`: on a node payment event, re-read `list_channels`, diff vs latest snapshot, persist changed rows (`source=EVENT`), emit `balance-changed { channelId, outbound, inbound, state, at }` (liquidity-meaning events — never raw node events).
4. `RealtimeGateway`: broadcast to connected browsers. Frontend `useFiberSocket` (already stubbed) subscribes.

**Verify.** Open the dashboard; make a small on-node payment → a bar moves on its own within one poll interval (or sooner via the event-triggered re-read). Kill the node WS → poll keeps bars fresh. Env: `POLL_INTERVAL_MS`, `FIBER_WS_URL`. Deps: `@nestjs/websockets` + `@nestjs/platform-ws` + `ws`, `@nestjs/schedule` for `@Interval`.

---

## Step 5 — "Can I pay?" probe (routing context; deterministic + safe)

**Goal.** A pre-flight check that answers "can I pay X to Y?" with a fee and the bottleneck hop — **without moving funds**. Safe to demo even before channels/rebalance work.

**New context — `routing`** (read-through; repository wraps `FIBER_RPC`):
```
modules/routing/
  routing.module.ts  routing.public.ts
  controllers/routing.controller.ts   # POST /routing/probe
  services/routing.service.ts
  repositories/routing.repository.ts   # wraps FIBER_RPC: sendPaymentDryRun(), buildRouter()
  mappers/routing.mapper.ts            # SendPaymentResponse/router_hops -> ProbeResultDto (hex->decimal, bottleneck hop)
  dto/probe-request.dto.ts (Zod)  dto/probe-result.dto.ts
  types/routing.types.ts
```

**RPC / node facts (verified).** Add to `FiberRpcClient`:
- `send_payment` with **`dry_run: true`** → real pathfinding, no funds move. Response (same shape as `get_payment`): `{ payment_hash, status, fee (u128 hex), routers: SessionRoute[] }`. Params include `target_pubkey`/`invoice`, `amount`, `max_fee_amount`, `dry_run`, etc.
- `build_router` → `{ router_hops: RouterHop[] }` (`{ target, channel_outpoint, amount_received (hex), incoming_tlc_expiry }`); params `{ amount?, udt_type_script?, hops_info: HopRequire[], final_tlc_expiry_delta? }`.

**Key logic.** Controller validates the Zod `ProbeRequestDto` (`{ targetPubkey | invoice, amount }`) with `ZodValidationPipe`. Service calls `send_payment {dry_run:true}` → `{ payable, fee, hops }`. Cross-reference each hop's `outbound_liquidity` (from `graph_channels`, via `NODE_SERVICE.graphChannels()`) to flag the **bottleneck hop** (least available liquidity along the path). Return `ProbeResultDto { payable, fee, hops[], bottleneckHop }` — amounts as decimal strings.

**Verify.** `POST /routing/probe` with a payable amount → `{ payable:true, fee, hops, bottleneckHop }`; an amount above available liquidity → `{ payable:false, bottleneckHop }`. Nothing moves on-chain.

---

## Step 6 — Rebalance engine (off-request worker; idempotent; double-entry ledger)

**Goal.** Self-heal a depleted channel by sending a **circular self-payment** (out an over-funded channel, back in the depleted one), executed **off the request path** with retries, recorded in a **balanced double-entry ledger**. Uses the `rebalance_job` + `ledger_entry` tables (already migrated in Step 2).

**New contexts — `rebalance` + `ledger`** (persistence; repositories wrap Prisma):
```
modules/rebalance/
  rebalance.module.ts  rebalance.public.ts
  controllers/rebalance.controller.ts  # POST /rebalance -> 202 { jobId }; GET /rebalance/:id
  services/rebalance.service.ts        # request(): idempotent enqueue
  services/rebalance.executor.ts       # worker job: build_router -> send_payment_with_router -> poll -> ledger
  repositories/rebalance-job.repository.ts   # Prisma; FOR UPDATE by idempotencyKey
  mappers/rebalance.mapper.ts
  dto/rebalance-request.dto.ts (Zod)  dto/rebalance-job.dto.ts
  queues/rebalance.queue.ts            # BullMQ queue + processor; standalone worker.ts entry
modules/ledger/
  ledger.module.ts  ledger.public.ts
  repositories/ledger.repository.ts    # writeDoubleEntry(job, tx) with balanced assertion
  mappers/ledger.mapper.ts  dto/ledger-entry.dto.ts
```

**RPC / node facts (verified).** Add to `FiberRpcClient`:
- `build_router` with circular `hops_info` (starts+ends at our node through two different channels).
- `send_payment_with_router { router: RouterHop[], payment_hash?, keysend?, udt_type_script?, dry_run? }` — the circular path is encoded in `router` (note: `allow_self_payment` is documented on `send_payment`, **not** here — verify the self-payment executes on the running node).
- `get_payment { payment_hash }` → `status: "Created" | "Inflight" | "Success" | "Failed"` (PascalCase).

**Key logic.**
1. `POST /rebalance { sourceChannelId, destChannelId, amount, maxFee, idempotencyKey }` → `RebalanceService.request()`: in a **`Serializable`** `$transaction`, `SELECT … FOR UPDATE` an existing job by `idempotencyKey` (unique). If found → return it (no re-exec). Else insert `RebalanceJob(PENDING)`, enqueue a BullMQ job, return **202 { jobId }**. Retry `P2034` serialization failures in a bounded loop.
2. **Worker** (`rebalance.executor`, embedded when `RUN_WORKER_INLINE=true`, else standalone `NestFactory.createApplicationContext`; BullMQ attempts + backoff): `build_router` (circular) → `send_payment_with_router` → poll `get_payment` until `Success|Failed`, pushing each transition to `RealtimeGateway`.
3. On `Success`, in **one `Serializable` txn**: update job (`SUCCEEDED`, `feePaid`, `paymentHash`) **and** write the double-entry pair via `LedgerRepository`:
   - `LedgerEntry{ source, OUTBOUND, PRINCIPAL, amount }`, `{ dest, INBOUND, PRINCIPAL, amount }`, `{ source, OUTBOUND, FEE, fee }`.
   - **Balanced invariant:** `Σ OUTBOUND (principal+fee) == Σ INBOUND principal + fee` — the repository rejects an unbalanced write.
4. On failure/exhaustion → `FAILED` with `error`; no ledger pair. On settle, trigger a fresh snapshot (feeds Step 7).

**Verify.** Submit a rebalance between two channels you control; watch `Created→Inflight→Success` transitions animate; source bar drops, dest rises; the job's ledger balances; **re-submitting the same `idempotencyKey` returns the same job without moving funds again**. Env: `REDIS_URL`, `RUN_WORKER_INLINE`. Deps: `bullmq` + `ioredis`. (Needs ≥ 2 `ChannelReady` channels — see `infra/README.md §3`.)

---

## Step 7 — Reconciliation

**Goal.** Detect and surface **drift** between our latest snapshot and the node's live balances — the node always wins; we flag, we never "correct" the node.

**New context — `reconciliation`** (persistence + `NODE_SERVICE`):
```
modules/reconciliation/
  reconciliation.module.ts  reconciliation.public.ts
  controllers/reconciliation.controller.ts   # GET /reconciliation/status
  services/reconciliation.service.ts          # compare latest snapshot vs fresh list_channels
  repositories/reconciliation.repository.ts    # reads ChannelSnapshot (reuses channels' latestPerChannel)
  mappers/reconciliation.mapper.ts  dto/reconciliation-status.dto.ts
```

**Key logic.** On demand (and after each rebalance settle / poll), compare `latestPerChannel()` (BigInt) against a fresh `NODE_SERVICE.listChannels()` (BigInt). Per channel emit `{ channelId, inSync, snapshotBalance, nodeBalance, driftAt }` where `inSync = |snapshot − node| ≤ tolerance`. When drift is found, **re-snapshot from the node** (node wins) and record the drift event. All comparison in BigInt — never `Number`.

**Verify.** After a rebalance → `GET /reconciliation/status` shows in-sync. Force drift (stale a snapshot, or move funds out-of-band on the node) → the drift flag lights, then clears after re-snapshot.

---

## Deployment (built out at the end)

- **Backend → Render Web Service**: `pnpm --filter backend build`; start `node dist/main`; release `prisma migrate deploy`; health `/health`; env `DATABASE_URL` (Render Postgres), `REDIS_URL` (Render Key Value/Upstash), `CORS_ORIGINS`, `FIBER_RPC_URL`/`FIBER_WS_URL` (private to the node host), `DASHBOARD_SECRET`. WS gateway + inline worker on a single instance, or a dedicated Background Worker when `RUN_WORKER_INLINE=false`.
- **Frontend → Vercel/Render (separate)**: `output:'standalone'`; env `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`.
- **FNN node**: persistent host / private network; **biscuit auth** (or the dev socat proxy) to expose RPC; never publish `8227`/`8299` unauthenticated.
