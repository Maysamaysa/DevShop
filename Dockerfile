FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build the specified app (and related libs)
ARG APP_NAME
RUN npm run build ${APP_NAME}

# Production Image
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Only copy production dependencies initially to keep image size small
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /usr/src/app/dist ./dist

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Run the specified app
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main"]
