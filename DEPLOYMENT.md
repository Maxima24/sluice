# Deployment & Operations

## What runs where (current production)

```
Browser ──► sluice.drreamer.digital        (Next.js frontend, Docker image on the VPS)
                │  NEXT_PUBLIC_API_URL = https://api.sluice.drreamer.digital
                │  NEXT_PUBLIC_WS_URL  = wss://api.sluice.drreamer.digital
                ▼
           api.sluice.drreamer.digital      (NestJS backend, Docker image on the VPS)
                │   ├─ DATABASE_URL ─► Neon Postgres
                │   └─ REDIS_URL ────► Upstash Redis (BullMQ)
                │  FIBER_RPC_URL = http://127.0.0.1:8299   (loopback — same VPS)
                ▼
           Fiber node (FNN)                  (Docker on the SAME VPS; RPC never public)
```

Both apps are Docker images managed by **Dokploy** on one VPS (`152.53.241.136`); the platform's
reverse proxy terminates TLS for both subdomains. The Fiber node runs on the same host, so the
backend talks to it over `127.0.0.1:8299` — no tunnel, and port `8299` is **not** open to the
internet (verified: it refuses external connections).

Everything is env-driven; nothing is hardcoded.

---

## 1. Backend (Docker on the VPS)

The root **`Dockerfile`** builds the backend from the monorepo, runs `prisma migrate deploy` on
start, then launches `node backend/dist/main.js` bound to `0.0.0.0:$PORT`.

Dokploy: new **Application** → this repo → build type **Dockerfile** (context = repo root). Env vars:

| Var | Value |
|-----|-------|
| `DATABASE_URL` | Neon URL (`postgresql://…neon.tech/…?sslmode=require`) |
| `REDIS_URL` | Upstash URL (`rediss://default:…@…upstash.io:6379`) |
| `FIBER_RPC_URL` | `http://127.0.0.1:8299` (node on the same host) |
| `FIBER_WS_URL` | `ws://127.0.0.1:8299` |
| `CORS_ORIGINS` | `https://sluice.drreamer.digital` |
| `DASHBOARD_SECRET` | a long random string (see Security) — enables the write gate |
| `RUN_WORKER_INLINE` | `true` (single instance runs the poller + WS + worker) |
| `POLL_INTERVAL_MS` | `15000` |

Don't set `PORT` — Dokploy/Render inject it.

**Run the image locally:** `docker build -t fiber-backend . && docker run -p 3000:3000 --env-file backend/.env fiber-backend`.

## 2. Frontend (Docker on the VPS)

`frontend/Dockerfile` builds the Next standalone output. The `NEXT_PUBLIC_*` vars are **baked at
build time** (Next inlines them), so set them as Dokploy **build args**:

- `NEXT_PUBLIC_API_URL` = `https://api.sluice.drreamer.digital`
- `NEXT_PUBLIC_WS_URL` = `wss://api.sluice.drreamer.digital` (the hook appends `/realtime`)

## 3. The Fiber node (same VPS)

Run `nervos/fiber` via `infra/docker-compose.fiber.yml`. On a shared host, **bind the RPC to
loopback only** so it is never publicly reachable — change the port mapping to
`"127.0.0.1:8299:8299"` (P2P `8228` stays public). See `infra/README.md` for the wallet-key step.

---

## Security

Verified live posture: CORS pinned to the dashboard origin, `helmet` headers on (CSP/HSTS/
X-Frame-Options), node RPC not reachable from the internet. The remaining control is the write gate:

- **`DashboardSecretGuard`** (global) allows all **reads** and, when `DASHBOARD_SECRET` is set,
  requires `X-Dashboard-Secret` on every **mutation** (`POST /rebalance`, …). `/health` is always
  public. Unset ⇒ allow-all (dev only).
- The frontend attaches the header from an operator-entered secret kept in `localStorage`
  (`frontend/lib/api/client.ts` → `dashboardAuth`); the rebalance page has the input. The secret is
  **never** in the public bundle, so a random visitor cannot queue a rebalance.
- **Set `DASHBOARD_SECRET` in production** — otherwise `POST /rebalance` is callable by anyone who
  can read the (public) channel IDs.

---

## Operator runbook

### Open channels (need ≥2 for a demoable rebalance)
Use the node CLI against the running container (see `infra/README.md §3`): fund the node from the
testnet faucet, `connect_peer`, then `open_channel`, and poll `list_channels` until the state is
`ChannelReady`. A useful rebalance target also needs **inbound** liquidity on at least one channel
(route some payments in, or open a channel with a peer who pushes balance to you) — a node whose
channels are all outbound-only can send but cannot complete a circular rebalance.

### Run a rebalance
1. Dashboard → **Rebalancing**. Pick an over-funded **source** channel and a depleted **destination**
   channel (candidates are listed), set **amount** + **max fee** (shannon), keep the auto **idempotency key**.
2. If the API is locked, enter the **Operator secret**.
3. **Queue rebalance** → the job card streams `PENDING → BUILDING → INFLIGHT → SUCCEEDED` (or `FAILED`
   with a reason). Re-submitting the same idempotency key returns the *same* job — it never executes twice.
4. Under the hood: `POST /rebalance` → serializable insert (unique key) → BullMQ → executor builds a
   circular router, fee-checks with `dry_run`, sends `send_payment_with_router`, polls `get_payment`,
   and on success writes the balanced ledger pair.

### Read the audit ledger
`GET /rebalance/:id` for job status; ledger entries are written per successful job (double-entry:
principal + fee OUTBOUND on the source, principal INBOUND on the dest — balanced or rejected).
Reconciliation drift (snapshot vs live node) is at `GET /reconciliation/status` and on the
**Reconciliation** page — the node always wins; drift is surfaced, never corrected.

### Verify a deploy
- `curl https://api.sluice.drreamer.digital/health` → `{"status":"ok",…}`
- `curl https://api.sluice.drreamer.digital/node/info` → live node identity (or `502` if the node is down)
- Open the dashboard → 2 channels with diverging bars, real peers, a green **live** chip.

---

## Alternative: Render + Vercel

The repo still supports the original PaaS path if you prefer it over a VPS:

- **Backend → Render:** `render.yaml` blueprint (Docker runtime, health check `/health`) provisions a
  Render Redis; Postgres stays external (Neon). Set `DATABASE_URL`, `CORS_ORIGINS`, `FIBER_*`,
  `DASHBOARD_SECRET` as manual (`sync:false`) vars. Bump off the free plan (it spins down, stopping
  the poller/WS/worker). Node reachability from Render needs a public node URL (a VPS or an auth'd
  tunnel) — Render can't reach `127.0.0.1`.
- **Frontend → Vercel:** import the repo, **Root Directory `frontend`**, set `NEXT_PUBLIC_API_URL` /
  `NEXT_PUBLIC_WS_URL` to the backend origin.

---

## Notes & caveats

- **Single instance:** the WS gateway + inline BullMQ worker + poller assume one instance. To scale
  horizontally, run the worker separately (`RUN_WORKER_INLINE=false`) and keep one web instance for
  WebSockets. (A standalone worker entrypoint is not yet built — inline is the supported mode.)
- **Migrations** run via `prisma migrate deploy` on container start; the client is generated at build.
- `subscribe_store_changes` is not supported by the rc7 node, so realtime is driven by the
  `list_channels` poller (`POLL_INTERVAL_MS`); the WS subscription is best-effort and self-disables.
