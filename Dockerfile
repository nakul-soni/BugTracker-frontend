# ---------- Dependencies Stage ----------
FROM node:22-alpine AS deps

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci


# ---------- Builder Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Reuse dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Build Next.js application
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the Next.js production build
COPY --from=builder /app/.next ./.next

# Copy public assets
COPY --from=builder /app/public ./public

# Copy Next.js configuration if present
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

# Start the production server
CMD ["npm", "start"]