# Fiber Liquidity Layer

An operability tool for a **CKB Fiber Network node (FNN)**: it makes a node's channel
liquidity visible, makes payments predictable via a `dry_run` pre-flight probe, and makes
channel balance self-healing via circular rebalancing. The Fiber node is a third-party Rust
binary we only *run* and talk to over JSON-RPC / WebSocket — this repo contains no Rust,
no CKB scripts, and no on-chain code.

The **node is always the source of truth** for balances; our Postgres stores snapshots, jobs,
and a double-entry audit ledger — records, never an authority over channel state.

## Live

| Surface | URL |
|---------|-----|
| Dashboard (frontend) | https://sluice.drreamer.digital |
| API (backend) | https://api.sluice.drreamer.digital |

Both run as Docker images on a single VPS via **Dokploy**; the Fiber node runs on the *same* VPS
and the backend reaches it over loopback (`127.0.0.1:8299`) — the node RPC is never exposed to the
internet. Postgres is **Neon**, Redis is **Upstash**. See [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Monorepo layout (pnpm workspaces)

```
backend/    NestJS 11 + Prisma 7 — the API, FiberRpcClient, snapshots, health, rebalance worker
frontend/   Next.js 16 App Router — the operator dashboard (infinite-canvas workspace, live data)
infra/      Docker: the testnet FNN node (+ a local Postgres/Redis for dev)   (see infra/README.md)
```

## Stack

- **Backend** — NestJS 11 (modular monolith), Prisma 7 (`@prisma/adapter-pg`), a single typed
  `FiberRpcClient` for all node comms, BullMQ + Redis worker for rebalances, a `/realtime` WS gateway.
- **Frontend** — Next 16 / React 19 / Tailwind v4, react-query, zod. Every panel is driven by the
  live API; nothing is mocked.
- **Amounts** are u128 handled as `BigInt` / decimal strings end-to-end — never JS `number`.

## Quick start (local dev)

```bash
pnpm install                                            # one install for both workspaces

# dependencies (Postgres on 5433, Redis on 6379)
docker compose -f infra/docker-compose.deps.yml up -d
pnpm --filter backend exec prisma migrate dev           # create tables

# testnet Fiber node (RPC/WS reachable on :8299) — see infra/README.md for the wallet-key step
docker compose -f infra/docker-compose.fiber.yml up -d

pnpm dev                                                # backend :3000 + frontend :3002
```

Copy `backend/.env.example` → `backend/.env` and set `frontend/.env.local` first
(`NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL`; the localhost defaults work out of the box).

## Security posture

- **Reads are public; mutations are gated.** When `DASHBOARD_SECRET` is set on the backend, any
  `POST/PUT/PATCH/DELETE` (i.e. `POST /rebalance`) requires an `X-Dashboard-Secret` header; `GET`s
  stay open. The operator enters the secret in the dashboard — it lives only in that browser and is
  never baked into the public bundle. Unset ⇒ allow-all (dev default).
- CORS is pinned to the dashboard origin; `helmet` sets CSP/HSTS/etc.; the node RPC is firewalled to
  loopback. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) §Security.

## Tests & CI

`pnpm --filter backend test` and `pnpm --filter frontend test` (vitest) cover the money path —
u128 conversions, the double-entry ledger, rebalance idempotency, and the liquidity/format
derivations. GitHub Actions (`.github/workflows/ci.yml`) runs typecheck + lint + test + build on
every push/PR to `main`/`staging`.

## Status

Backend Steps 0–7 and the frontend are complete and **live** end-to-end against a real testnet node
with funded channels. The build runbook is in [`backend-deliverable.md`](./backend-deliverable.md);
deployment + the operator runbook are in [`DEPLOYMENT.md`](./DEPLOYMENT.md).
