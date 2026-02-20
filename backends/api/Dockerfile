FROM node:22.20.0-alpine3.21 AS base
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .

FROM base AS builder
RUN npx prisma generate
RUN npm run build

FROM node:22.20.0-alpine3.21 AS runtime
WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/src/generated/libquery_engine-linux-musl-openssl-3.0.x.so.node /app/generated
COPY package*.json .
COPY prisma .
RUN npm ci --omit=dev
CMD ["npm", "run", "start:prod"]