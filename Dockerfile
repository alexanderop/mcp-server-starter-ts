# Build stage for dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage for TypeScript compilation
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV STARTER_TRANSPORT=http
ENV PORT=3000

# Copy built files and production dependencies
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
COPY --from=build /app/mcp.json ./
COPY --from=build /app/.vscode/mcp.json ./.vscode/

# Install only production dependencies
RUN npm ci --omit=dev

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Expose the HTTP port
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/mcp', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the server
CMD ["node", "build/index.js"]