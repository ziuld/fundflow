# STAGE 1 — BUILD
# Install dependencies and build the Vite production bundle
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first — Docker caches this layer
# so npm install is skipped if dependencies haven't changed
COPY package*.json .
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# STAGE 2 — RUNTIME
# Serve the built static files with nginx
# nginx is ~20MB vs node:20 at ~180MB — much lighter
FROM nginx:alpine AS runtime

# Copy the Vite build output to nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config — needed to handle React Router
# Without this, refreshing any non-root URL returns 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80