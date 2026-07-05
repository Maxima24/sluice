# Infra — local dev stack

Two things run in Docker: the backend's **dependencies** (Postgres, Redis) and the
third-party **Fiber node (FNN)**. We only *run* the FNN image — no Rust, no forks.

## 1. Dependencies (Postgres + Redis)

```bash
docker compose -f infra/docker-compose.deps.yml up -d
```

- Postgres is on host port **5433** (not 5432, to avoid a native Windows Postgres install).
- Backend `DATABASE_URL` → `postgresql://fiber:fiber@127.0.0.1:5433/fiber`.
- Run migrations: `cd backend && npx prisma migrate dev`.

## 2. Fiber node (FNN) — testnet

The node needs a **CKB wallet key** before it starts (the image does not generate one).
Create a plaintext 32-byte hex key; the node encrypts it in place on first run.

```bash
mkdir -p infra/fiber/data/ckb
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" \
  | tr -d '\n' > infra/fiber/data/ckb/key

FIBER_SECRET_KEY_PASSWORD=dev-password \
  docker compose -f infra/docker-compose.fiber.yml up -d
```

- **RPC/WS is reached on host port `8299`** via a `socat` sidecar. FNN 0.9.x refuses to
  bind RPC to a public address without biscuit auth, so the node keeps RPC on its secure
  default `127.0.0.1:8227` and the sidecar (sharing its netns) forwards `8299 → 127.0.0.1:8227`.
- Backend `.env`: `FIBER_RPC_URL=http://127.0.0.1:8299`, `FIBER_WS_URL=ws://127.0.0.1:8299`.
- P2P is on `8228`.

Verify:
```bash
curl -s -X POST http://127.0.0.1:8299 -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"node_info","params":[]}'
# -> result.version, result.pubkey, peers_count > 0
```

> **Production note:** the `socat` proxy is dev-only. For a publicly reachable node, set up
> **biscuit auth** (`rpc.biscuit_public_key` + a Bearer token sent by `FiberRpcClient`) and
> bind `0.0.0.0` — or co-locate the node with the backend on a private network. Never expose
> `8227`/`8299` to the internet unauthenticated.

## 3. Fund the wallet + open a channel (to get non-empty `list_channels`)

Until a channel is open, `list_channels` is empty and `/channels/health` returns `[]` (this
is still a healthy state — connectivity is proven by `node_info`).

1. **Fund** the node's CKB address from the testnet faucet (https://faucet.nervos.org).
   This node's funding address (derived from `node_info.default_funding_lock_script`, standard
   secp256k1_blake160 lock — verify with `ckb-cli`/an explorer before sending):

   ```
   ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq09kalv74ns0ua8pu9epps84j6yrckx5uc34kgxy
   ```
   (Address changes if you regenerate `infra/fiber/data/ckb/key`.)

2. **Connect to a peer and open a channel** via the bundled CLI (talks to the node's RPC inside
   the container):
   ```bash
   docker exec -it fiber-node fnn-cli info                 # node + peers
   docker exec -it fiber-node fnn-cli peer --help          # connect_peer
   docker exec -it fiber-node fnn-cli channel --help       # open_channel { pubkey, funding_amount, public:true }
   ```
   Poll until `state.state_name == "ChannelReady"`. For **rebalancing** (Step 6) you need **≥ 2**
   channels you control.

3. Re-check: `curl http://localhost:3000/node/channels` and `curl http://localhost:3000/channels/health`
   → now `{ source:'live' }` with real balances (hex on the node, decimal in our DTOs).

## Teardown

```bash
docker compose -f infra/docker-compose.fiber.yml down
docker compose -f infra/docker-compose.deps.yml down
# node data (keys, chain store) persists in infra/fiber/data (gitignored)
```
