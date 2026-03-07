# ============================
# Stage 1: Build Frontend
# ============================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
ARG VITE_API_URL=/api
ARG VITE_BASE_URL=https://url-shortner-r2k9.onrender.com
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# ============================
# Stage 2: Setup Backend
# ============================
FROM node:18-alpine
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
# Copy built frontend from Stage 1 into backend's dist folder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 5000
CMD ["npm", "start"]
