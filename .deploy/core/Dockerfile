# Ever Core (API)

ARG NODE_OPTIONS
ARG NODE_ENV
ARG API_BASE_URL
ARG API_HOST
ARG API_PORT
ARG DB_URI
ARG DB_HOST
ARG DB_NAME
ARG DB_PORT
ARG DB_USER
ARG DB_PASS
ARG DB_TYPE
ARG DB_SSL_MODE
ARG DEMO
ARG HOST
ARG PORT

FROM node:alpine AS dependencies

LABEL maintainer="ever@ever.co"

ENV CI=true

RUN apk update \
	&& apk add libexecinfo libexecinfo-dev \
	&& npm i -g npm \
	&& apk --no-cache add --virtual builds-deps build-base \
	snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	mkdir /srv/ever && chown -R node:node /srv/ever

COPY wait .deploy/core/entrypoint.sh /
RUN chmod +x /wait /entrypoint.sh && dos2unix /entrypoint.sh

USER node:node

WORKDIR /srv/ever

COPY --chown=node:node package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY --chown=node:node packages/core/package.json ./packages/core/package.json
COPY --chown=node:node .snyk ./.snyk
COPY --chown=node:node packages/core/.snyk ./packages/core/.snyk
COPY --chown=node:node packages/common ./packages/common

RUN yarn install --frozen-lockfile && yarn cache clean

FROM node:alpine AS development

USER node:node

WORKDIR /srv/gauzy

COPY --chown=node:node --from=dependencies /wait /entrypoint.sh /
COPY --chown=node:node --from=dependencies /srv/ever .
COPY . .

FROM node:alpine AS build

WORKDIR /srv/ever

RUN mkdir dist

COPY --chown=node:node --from=development /srv/ever .

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV DEMO=${DEMO:-false}

ENV IS_DOCKER=true

RUN yarn build:server

FROM node:alpine AS production

WORKDIR /srv/ever

RUN mkdir /srv/ever && chown node:node /srv/ever
RUN mkdir -p /srv/ever/packages/core && chown node:node /srv/ever/packages/core
RUN mkdir -p /srv/ever/packages/common && chown node:node /srv/ever/packages/common

COPY --chown=node:node --from=dependencies /wait ./wait
COPY --chown=node:node --from=dependencies /entrypoint.sh .
COPY --chown=node:node --from=dependencies /srv/ever/node_modules ./node_modules
COPY --chown=node:node --from=build /srv/ever/packages/common/ ./packages/common/
COPY --chown=node:node --from=build /srv/ever/packages/core/ ./packages/core/

RUN npm install cross-env -g \
	&& npm install pm2 -g --unsafe-perm \
	&& touch ormlogs.log && chown node:node ormlogs.log \
	&& chown node:node wait && chmod +x /wait

USER node:node

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV API_HOST=${API_HOST:-api}
ENV API_PORT=${API_PORT:-5500}
ENV API_BASE_URL=${API_BASE_URL:-http://localhost:5500}
ENV DB_URI=${DB_URI}
ENV DB_HOST=${DB_HOST:-db}
ENV DB_NAME=${DB_NAME:-ever}
ENV DB_PORT=${DB_PORT:-27017}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}
ENV DB_TYPE=${DB_TYPE:-mongodb}
ENV DB_SSL_MODE=${DB_SSL_MODE}
ENV HOST=${HOST:-0.0.0.0}
ENV PORT=${PORT:-5500}
ENV DEMO=${DEMO:-false}

# 5500 for HTTP
# 5501 for HTTPS
# 5555 for GraphQL
# 5050 for GraphQL Subscriptions

EXPOSE ${PORT} 5501 5050 5555

CMD [ "pm2-runtime", "main.js" ]