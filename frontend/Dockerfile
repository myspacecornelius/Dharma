# Base Image
FROM node:20-alpine

# Set Work Directory
WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.json
COPY next.config.ts next.config.ts

# Install Dependencies
# Use `npm ci` if package-lock.json exists, otherwise `npm install`
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy Application Code
COPY . .

# Expose Port
EXPOSE 5173

# Run Development Server
CMD ["npm", "run", "dev", "--", "--host"]
