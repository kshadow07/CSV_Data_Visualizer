# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Expose port 5173
EXPOSE 5173

# Start the application with host flag
CMD ["npm", "run", "dev", "--", "--host"]
