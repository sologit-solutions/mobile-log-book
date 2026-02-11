FROM node:22.20.0-alpine3.21 AS base
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npx prisma generate

FROM base AS builder
RUN npm run build
RUN npx prisma generate

FROM node:22.20.0-alpine3.21 AS runtime
WORKDIR /app
COPY --from=builder /app/dist .
COPY package*.json .
COPY prisma .
RUN npm ci --omit=dev
CMD ["npm", "run", "start:prod"]