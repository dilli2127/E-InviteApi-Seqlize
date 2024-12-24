# Use an official Node.js 20 runtime as a parent image
FROM node:20

# Install dependencies required for bcrypt and other native modules
RUN apt-get update && apt-get install -y build-essential python3

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8246

# Set environment variables if needed
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
