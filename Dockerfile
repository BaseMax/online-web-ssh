# Online Web SSH Frontend Dockerfile

FROM node:20-alpine as builder

LABEL maintainer="Seyyed Ali Mohammadiyeh (MAX BASE) <maxbasecode@gmail.com>"
LABEL description="Online Web SSH - Web-based SSH Client"
LABEL version="1.0.0"

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY index.html ./
COPY static ./static/

# Production stage - Use lightweight HTTP server
FROM node:20-alpine

WORKDIR /app

# Install http-server globally
RUN npm install -g http-server

# Copy files from builder
COPY --from=builder /app .

# Create non-root user for security
RUN addgroup -g 1000 webssh && \
    adduser -D -u 1000 -G webssh webssh && \
    chown -R webssh:webssh /app

# Switch to non-root user
USER webssh

# Expose port
EXPOSE 8080

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start HTTP server
CMD ["http-server", "-p", "8080", "-c-1", "-a", "0.0.0.0"]
