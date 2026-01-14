# ruta: frontend/Dockerfile
# Stage 1: Install dependencies and build the project
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy built files from `builder` stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static/ ./.next/static/
COPY --from=builder /app/public ./public 

EXPOSE 3000

CMD ["node", "server.js"]
