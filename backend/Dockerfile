FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache docker-cli

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

COPY modules ./modules
COPY templates ./templates
COPY scripts ./scripts

EXPOSE 8080

CMD ["node", "dist/index.js"]