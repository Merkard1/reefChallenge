# Use Node 18 Bullseye Slim for better native module compatibility
FROM node:18-bullseye-slim

# Install build tools required for compiling native modules, including netcat for waiting
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    netcat \
    && rm -rf /var/lib/apt/lists/*

# Force native modules to be built from source
ENV npm_config_build_from_source=true

# Set working directory
WORKDIR /app/backend

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency files and Prisma schema first
COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/prisma ./prisma

# Install dependencies (force fresh installs)
RUN pnpm install --force

# Generate Prisma Client
RUN pnpm prisma generate

# Copy the remaining backend source code
COPY backend .

# Set the DATABASE_URL to use the database service name ('db') 
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/mydb?schema=public"

# Expose the NestJS port
EXPOSE 4444

# At container runtime, wait for the DB, run migrations, then start the app
CMD ["sh", "-c", "until nc -z db 5432; do echo 'Waiting for db...'; sleep 1; done && pnpm prisma migrate deploy && pnpm start:dev"]