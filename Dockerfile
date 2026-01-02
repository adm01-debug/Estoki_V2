# ESTOKI WMS - Production Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_ENV=production

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_ENV=$VITE_APP_ENV

# Build the application
RUN npm run build

# Stage 3: Production
FROM nginx:1.25-alpine AS production

# Install additional tools
RUN apk add --no-cache curl tzdata

# Set timezone
ENV TZ=America/Sao_Paulo

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Labels
LABEL maintainer="Promo Brindes <ti@promobrindes.com.br>"
LABEL version="1.0"
LABEL description="ESTOKI WMS - Sistema de Gestão de Estoque"

# Run as non-root
USER appuser

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
