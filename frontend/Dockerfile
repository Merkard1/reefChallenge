# Use Node 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app/frontend

# Install pnpm globally
RUN npm install -g pnpm

# Copy only the dependency files first
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of your frontend code directly into /app/frontend
COPY frontend ./

# Expose port 5173 (Vite or CRA dev server)
EXPOSE 5173

# Start dev server with --host binding
CMD ["pnpm", "dev", "--host"]