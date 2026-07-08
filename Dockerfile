# ---------- 1. Base ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# ---------- 2. Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- 3. Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the Next.js app AND the custom server
RUN pnpm build
RUN pnpm exec tsc server.ts --outDir dist --esModuleInterop --skipLibCheck

# Clean up dev dependencies and Next.js cache to reduce image size drastically
RUN pnpm prune --prod
RUN rm -rf .next/cache

# ---------- 4. Production ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy pruned production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy Next.js build output and compiled server
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist ./dist
COPY package.json ./

EXPOSE 3000

# Run the compiled server
CMD ["node", "dist/server.js"]
