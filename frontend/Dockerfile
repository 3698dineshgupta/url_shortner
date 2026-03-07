# ============================
# Stage 1: Build React App
# ============================
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Receive build arguments from docker-compose
ARG VITE_API_URL
ARG VITE_BASE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the app for production (outputs to /app/dist)
RUN npm run build

# ============================
# Stage 2: Serve with Nginx
# ============================
FROM nginx:alpine

# Copy custom Nginx configuration to handle React Router navigation
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
