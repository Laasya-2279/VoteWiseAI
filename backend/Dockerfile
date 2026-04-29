FROM node:18-alpine

WORKDIR /app

# Copy dependency files first for layer caching
COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY src/ ./src/

# Security: run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["node", "src/index.js"]
