FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN cd packages/shared && pnpm run build 2>/dev/null || true
RUN cd apps/api && pnpm run build

# ── Production image ───────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN npm install -g pnpm

# Keep WORKDIR at /app so "node apps/api/dist/main.js" path is correct
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

RUN mkdir -p apps/api/uploads/products

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
