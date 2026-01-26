FROM node:20-slim AS deps
WORKDIR /app

# Copy package files and install dependencies (use npm install to avoid lockfile mismatch in CI build)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Vite app (outputs to /app/dist)
RUN npm run build

# Serve production build with nginx
FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
