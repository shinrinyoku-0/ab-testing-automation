# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

ENV NODE_ENV=production

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage (dist includes public/sample_data/)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
