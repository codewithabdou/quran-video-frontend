# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build arguments for Vite environment variables
ARG VITE_NODE_API_URL=http://localhost:5000
ARG VITE_VAPID_PUBLIC_KEY=BAqqxEojYcFySQXkj5aeI88jlXmmXE_wbGqDlAvau2OIxvBM1mblB8QKEIVj-FCxKL4paAzIne4O_wXxifF0r8M

ENV VITE_NODE_API_URL=$VITE_NODE_API_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine

# Copy built static files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
