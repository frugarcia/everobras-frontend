# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable pnpm

# Copy dependency manifests first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build args for Vite env vars (injected at build time)
ARG VITE_API_URL

# Build the production bundle
RUN pnpm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:stable-alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
