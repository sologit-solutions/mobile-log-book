FROM node:22.20.0-alpine3.21 AS base
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .

FROM base AS builder
RUN npm run build

FROM node:22.20.0-alpine3.21 AS runtime
WORKDIR /app
COPY package*.json .
COPY --from=builder /app/dist .
RUN npm ci --omit=dev
CMD ["npm", "run", "start:prod"]