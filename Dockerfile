# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 py3-pip gettext

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the TypeScript project
RUN pnpm run build

# Production stage
FROM node:22-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Install Python 3.11+ and pip (mcpo is a Python package, not npm)
RUN apk add --no-cache python3 py3-pip

# Install pnpm for installing Node.js production dependencies
RUN npm install -g pnpm

# Install mcpo (MCP-to-OpenAPI proxy) as a Python package
# Pinned to mcpo 0.0.20; bump as needed.
RUN pip install --no-cache-dir --break-system-packages 'mcpo==0.0.20' && \
    rm -rf /root/.cache

# Copy only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create MCPO config file
RUN echo '{"mcpServers":{"omnisearch":{"command":"node","args":["dist/index.js"],"env":{"BRAVE_API_KEY":"${BRAVE_API_KEY}","TAVILY_API_KEY":"${TAVILY_API_KEY}","KAGI_API_KEY":"${KAGI_API_KEY}","PERPLEXITY_API_KEY":"${PERPLEXITY_API_KEY}","JINA_AI_API_KEY":"${JINA_AI_API_KEY}","FIRECRAWL_API_KEY":"${FIRECRAWL_API_KEY}"}}}}' > /app/mcpo-config.json

# Create startup script
RUN printf '#!/bin/sh\nset -eu\nenvsubst < /app/mcpo-config.json > /app/mcpo-config-final.json\nexec mcpo --port ${PORT:-8000} --config /app/mcpo-config-final.json\n' > /app/start.sh

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app && chmod +x /app/start.sh

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pgrep -x "mcpo" > /dev/null || exit 1

# Expose port for MCPO
EXPOSE 8000

# Set environment to production
ENV NODE_ENV=production

# Run as non-root user
USER nodejs

# Run the startup script
CMD ["/app/start.sh"]
