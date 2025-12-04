# =========================
# 1) Stage cài dependency
# =========================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy file cấu hình package
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# =========================
# 2) Stage build Next.js
# =========================
FROM node:20-alpine AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy toàn bộ source code
COPY . .

# Build app
RUN npm run build

# =========================
# 3) Stage runtime
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy cần thiết cho runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY package.json next.config.* tsconfig.json ./ 2>/dev/null || true

EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
