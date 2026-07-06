# Backend image for the pnpm monorepo. Build FROM THE REPO ROOT:
#   docker build -f backend/Dockerfile -t fiber-backend .
# Render uses the native Node runtime by default (see render.yaml); this Dockerfile
# is for Docker-based deploys / co-locating the backend with the node.
FROM node:20-alpine
RUN corepack enable
WORKDIR /app

# Install only the backend workspace subtree (root manifests + both package.json
# so pnpm can resolve the workspace graph).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter backend...

# Build
COPY backend ./backend
RUN pnpm --filter backend exec prisma generate && pnpm --filter backend build

ENV NODE_ENV=production
EXPOSE 3000
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "pnpm --filter backend exec prisma migrate deploy && pnpm --filter backend start:prod"]
