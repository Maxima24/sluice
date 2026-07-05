# Fiber Liquidity Layer

An operability tool for a **CKB Fiber Network node (FNN)**: it makes a node's channel
liquidity visible, makes payments predictable via a `dry_run` pre-flight probe, and makes
channel balance self-healing via circular rebalancing. The Fiber node is a third-party Rust
binary we only *run* and talk to over JSON-RPC / WebSocket — this repo contains no Rust,
no CKB scripts, and no on-chain code.

The **node is always the source of truth** for balances; our Postgres stores snapshots, jobs,
and a double-entry audit ledger — records, never an authority over channel state.

## Monorepo layout (pnpm workspaces)

```
backend/    NestJS 11 + Prisma 7 — the API, FiberRpcClient, snapshots, health   (deploys to Render)
frontend/   Next.js 16 App Router — the dashboard                                (deploys separately)
infra/      Docker: local Postgres/Redis + the testnet FNN node                  (see infra/README.md)
```

## Quick start

```bash
pnpm install                                            # one install for both workspaces

# dependencies (Postgres on 5433, Redis on 6379)
docker compose -f infra/docker-compose.deps.yml up -d
pnpm --filter backend exec prisma migrate dev           # create tables

# testnet Fiber node (RPC/WS reachable on :8299) — see infra/README.md for the wallet key step
FIBER_SECRET_KEY_PASSWORD=dev-password \
  docker compose -f infra/docker-compose.fiber.yml up -d

pnpm dev                                                # backend :3000 + frontend :3001
```

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env.local` first.

## Status & next steps

Build order 0–2 (testnet node + infra, backend spine + `FiberRpcClient` + `node` context,
Prisma schema + `channels` health) is live against a real testnet node. The remaining backend
work (Steps 4–7: realtime, routing probe, rebalance engine, reconciliation) is specced in
[`backend-deliverable.md`](./backend-deliverable.md).
