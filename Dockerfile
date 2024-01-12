# BUILD FOR LOCAL DEVELOPMENT

FROM node:20.10.0-bookworm-slim AS development

RUN apt-get update && apt-get install -y procps && apt-get install -y openssl

USER node

WORKDIR /usr/src/app/statement-api

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

RUN npx prisma generate


# BUILD FOR PRODUCTION

FROM node:20.10.0-bookworm-slim AS build

USER node

WORKDIR /usr/src/app/statement-api

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production


# PRODUCTION: Running the application:

FROM node:20.10.0-bookworm-slim AS production

RUN apt-get update && apt-get install -y openssl

USER node

WORKDIR /usr/src/app/statement-api

COPY --chown=node:node --from=build /usr/src/app/statement-api/package.json ./
COPY --chown=node:node --from=build /usr/src/app/statement-api/.env ./.env
COPY --chown=node:node --from=build /usr/src/app/statement-api/prisma ./prisma
COPY --chown=node:node --from=build /usr/src/app/statement-api/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/statement-api/node_modules ./node_modules

RUN npx prisma generate
