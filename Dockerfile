FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json package-lock.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy Prisma schema first (needed for generate)
COPY prisma ./prisma/

# Generate Prisma client with correct binaries for Railway
RUN npx prisma generate

# Copy source code
COPY . .

# Ensure TypeScript binary has execute permissions
RUN chmod +x ./node_modules/.bin/tsc

# Build the application
RUN npm run build

# Keep Prisma binaries even after pruning (they're needed at runtime)
RUN npm prune --production && npm install --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
