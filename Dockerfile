FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp and other native modules
RUN apk add --no-cache python3 make g++ git

RUN npm install -g pnpm

COPY . .

RUN pnpm install

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN  npm run build

# Production stage with Nginx
FROM nginx:alpine

# Install bash for better shell scripts
RUN apk add --no-cache bash

# Copy built assets from builder stage
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ./apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]