# Deployment — Backend on Render, Frontend on Vercel

```
Browser ──► Vercel (Next.js frontend)
                │  NEXT_PUBLIC_API_URL / NEXT_PUBLIC_WS_URL
                ▼
           Render Web Service (NestJS backend)  ──► Render Postgres
                │                                └─► Render Key Value (Redis, BullMQ)
                │  FIBER_RPC_URL / FIBER_WS_URL
                ▼
           Fiber node (FNN)  ◄── NOT on Render/Vercel — you host this (see §0)
```

Everything is env-driven; nothing is hardcoded. The only real decision is **where the Fiber node runs**.

---

## 0. Where the Fiber node runs (decide this first)

The backend needs `FIBER_RPC_URL` + `FIBER_WS_URL` reachable **from Render** — it can't reach `127.0.0.1` on your laptop. The node is stateful (wallet key, open channels) and its RPC is **unauthenticated**, so keep it private. Pick one:

| Option | Good for | How |
|--------|----------|-----|
| **A. Small VPS** (recommended for real use) | a persistent testnet node | Run `nervos/fiber` via `infra/docker-compose.fiber.yml` on a cheap VPS; point `FIBER_RPC_URL`/`FIBER_WS_URL` at it over a private network or an auth'd tunnel. |
| **B. Tunnel your local node** (fastest demo) | a quick end-to-end demo | `cloudflared tunnel --url http://127.0.0.1:8299` → gives an `https://…` URL. Set `FIBER_RPC_URL` to it and `FIBER_WS_URL` to the `wss://…` variant. Only works while your laptop + tunnel run. |
| **C. Render Private Service + disk** | cleanest prod | Run the node as a Render **private service** with a persistent disk; the backend reaches it via the internal hostname. Needs a paid plan + disk. |
| **D. Deploy now, wire node later** | infra-first | Leave `FIBER_RPC_URL` as a placeholder; the app boots and shows a "node down" state until you set a real URL. |

**Security:** never expose the node RPC (`8227`/`8299`) unauthenticated to the public internet. Use a private network or an access-controlled tunnel.

---

## 1. Backend → Render

### Option A — Blueprint (one click, uses `render.yaml`)
1. Render Dashboard → **New → Blueprint** → select this repo → **Apply**. It provisions **Postgres**, **Redis (Key Value)**, and the **web service**, runs `prisma migrate deploy` before traffic, and health-checks `/health`.
2. In the `fiber-backend` service → **Environment**, set the three `sync:false` vars:
   - `CORS_ORIGINS` = your Vercel origin (e.g. `https://fiber-liquidity.vercel.app`)
   - `FIBER_RPC_URL` / `FIBER_WS_URL` = your node from §0
3. **Plans:** bump the web service to **Starter** — the **free** plan spins down on idle, which stops the poller, WS gateway, and rebalance worker. Free Postgres also expires (~30 days).

### Option B — Manual web service
- Runtime **Node**, connect the repo, then:
  - **Build:** `corepack enable && pnpm install --frozen-lockfile && pnpm --filter backend build`  *(the backend `build` runs `prisma generate` first)*
  - **Start:** `pnpm --filter backend start:prod`
  - **Pre-Deploy:** `pnpm --filter backend exec prisma migrate deploy`
  - **Health Check Path:** `/health`
- Add a **Render Postgres** and a **Render Key Value** (Redis; set **maxmemory-policy = noeviction** for BullMQ). Wire `DATABASE_URL` + `REDIS_URL`.
- Env: `NODE_ENV=production`, `RUN_WORKER_INLINE=true`, `POLL_INTERVAL_MS=15000`, plus `CORS_ORIGINS` / `FIBER_RPC_URL` / `FIBER_WS_URL`.

**Docker alternative:** `backend/Dockerfile` builds the backend image (build context = repo root: `docker build -f backend/Dockerfile -t fiber-backend .`).

---

## 2. Frontend → Vercel

1. Vercel → **New Project** → import this repo.
2. **Root Directory: `frontend`** (Vercel detects the pnpm workspace + Next 16 automatically).
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend>.onrender.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://<your-backend>.onrender.com`  *(the hook appends `/realtime`)*
4. Deploy (build/output settings are Next.js defaults).

---

## 3. Wire CORS + verify

- Set the backend's `CORS_ORIGINS` to the Vercel origin and redeploy the backend.
- Checks:
  - `curl https://<backend>.onrender.com/health` → `{"statusCode":200,...}`
  - `curl https://<backend>.onrender.com/node/info` → live node (once `FIBER_RPC_URL` is set), or `502` if the node is down
  - Open the Vercel URL → node version + channel bars + a green **● live** dot (the WS to `/realtime`).

---

## 4. Notes & caveats

- **Security of `/rebalance`:** the money endpoint is **open** unless `DASHBOARD_SECRET` is set. To enable it, set `DASHBOARD_SECRET` on Render **and** add a Next server proxy (route handler) that injects `X-Dashboard-Secret`, so the browser never holds the secret. Fine to leave open for a testnet demo.
- **Single instance:** the WS gateway + inline BullMQ worker + poller assume one instance. To scale, run the worker as a separate Render **Background Worker** (`RUN_WORKER_INLINE=false`) and keep a single web instance for WebSockets.
- **Migrations** run via `prisma migrate deploy` (pre-deploy); the client is generated at build (`prisma generate`).
- The full **Nginx edge** stack from the original spec stays deferred — Render + Vercel provide TLS and routing.
