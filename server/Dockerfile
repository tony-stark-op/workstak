# Base Image
FROM node:20-slim

# Install Git (Required for git-http-backend and git operations)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Create App Directory
WORKDIR /app

# Install Dependencies
COPY package*.json ./
RUN npm install

# Copy Source Code
COPY . .

# Build TypeScript
RUN npm run build

# Create Directory for Persistent Volume (Placeholder)
RUN mkdir -p /app/vcs-data

# Environment Variables (Defaults, can be overridden by Railway)
ENV NODE_ENV=production
ENV PORT=4000
ENV GIT_REPOS_PATH=/app/vcs-data
ENV GIT_HTTP_BACKEND=/usr/lib/git-core/git-http-backend

# Expose Port
EXPOSE 4000

# Start Command
CMD ["npm", "start"]
