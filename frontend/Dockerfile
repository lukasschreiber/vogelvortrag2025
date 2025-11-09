# Stage 1: Build frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy and install deps using Yarn
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of your app
COPY . .

# Inject environment variables at build time
ARG VITE_BACKEND_URL
ARG VITE_EDIT_LINK_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_EDIT_LINK_KEY=$VITE_EDIT_LINK_KEY

# Build the Vite app
RUN yarn build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
