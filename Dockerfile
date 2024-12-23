# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN yarn install

# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8246

# Set environment variables if needed
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
