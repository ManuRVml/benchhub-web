# Stage 1: Build
FROM docker.io/library/node:24.14.1-bookworm-slim

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .pnpmfile.cjs ./

# Install dependencies (ignore scripts to skip unnecessary postinstall steps)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the rest of the source code
COPY . .

# Generate contract types (in case they are git-ignored)
RUN pnpm contract:generate

# Set environment variable for API mode
ENV VITE_API_MODE=http

# Build the application
RUN pnpm exec vite build

# Stage 2: Deploy with nginx
FROM docker.io/library/nginx:1.29-alpine

# Enable local DNS resolver via environment variable
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

# Copy built assets from stage 1
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy nginx configuration template (copied to /etc/nginx/templates/ at runtime)
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
