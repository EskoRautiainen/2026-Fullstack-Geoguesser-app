# Stage 1: Build the frontend
#--------------------------------------------------------------------------------------------------------------

# Starts from a Node.js 20 image
FROM node:20 AS frontend-builder

WORKDIR /app

# Copy package.json files first, before the source code.
# Docker caches each step (layer). If package.json hasn't changed,
# Docker reuses the cached npm install and skips it — much faster.
# npm ci needs every workspace's package.json to match package-lock.json
COPY package*.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install the exact versions from package-lock.json for the frontend workspace
RUN npm ci --workspace=frontend --include=dev

# Now copy the frontend source code
COPY frontend/ frontend/

# Build the frontend for optimized production (output goes to frontend/dist/)
RUN npm run build --workspace=frontend

# Stage 2: Build the backend and serve the frontend
#--------------------------------------------------------------------------------------------------------------
FROM node:20

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install only the backend's production dependencies, at the exact versions from package-lock.json
RUN npm ci --omit=dev --workspace=backend

COPY backend/ backend/

# Copy the built frontend files from Stage 1 into the backend's public/ directory, where express.static serves them
# The final image contains only the backend code and the production-ready frontend assets
COPY --from=frontend-builder /app/frontend/dist backend/public

# Expose port 3000 for backend
EXPOSE 3000

# Run node directly instead of through npm, so it receives SIGTERM from `docker stop` and shuts down cleanly
CMD ["node", "backend/index.js"]