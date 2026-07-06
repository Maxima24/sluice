# Root Dockerfile — builds & runs the backend from the pnpm monorepo.
#
# Render: New → Web Service → Runtime = Docker. Render auto-detects this file at
# the repo root (build context = repo root). Self-contained, so none of the
# native-build quirks apply here (corepack EROFS, NODE_ENV skipping devDeps,
# Node-version pinning) — the container controls all of it.
#
# Local: docker build -t fiber-backend . && docker run -p 3000:3000 --env-file backend/.env fiber-backend

FROM node:22-bookworm-slim

# openssl + CA certs for Prisma's engine and the Neon (TLS) connection.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# .dockerignore keeps node_modules / .env / .git out of the build context.
COPY . .

# Install ONLY the backend workspace (with devDeps: nest CLI / prisma / tsc are
# needed to build; frontend deps are skipped). The backend `postinstall` generates
# the Prisma client. Then compile.
RUN pnpm install --frozen-lockfile --filter backend
RUN pnpm --filter backend build

ENV NODE_ENV=production
EXPOSE 3000
# Apply pending migrations, then start. The app binds 0.0.0.0:$PORT (Render injects PORT).
CMD ["sh", "-c", "pnpm --filter backend exec prisma migrate deploy && node backend/dist/main.js"]
