# Stage 1 - Build Stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /usr/src/app

# Install dependencies for bcrypt or native modules
RUN apk add --no-cache python3 make g++ 

# Copy package.json and lock file to install dependencies
COPY package*.json ./

# Install all dependencies (including dev for building if needed)
RUN yarn install

# Copy application source code
COPY . .

# Build if needed (like TypeScript projects)
# RUN npm run build  # Uncomment if you have a build step

# Stage 2 - Production Stage (Final image)
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Only copy needed files from builder stage
COPY --from=builder /usr/src/app ./

# Install only production dependencies
RUN yarn install --production

# Expose port
EXPOSE 8246

# Environment
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]
