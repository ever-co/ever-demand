# Ever Platform API (Core)

ARG NODE_OPTIONS
ARG NODE_ENV
ARG API_BASE_URL
ARG API_HOST
ARG API_PORT
ARG SENTRY_DSN
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

FROM node:16-alpine3.11 AS dependencies

LABEL maintainer="ever@ever.co"

ENV CI=true

RUN apk --update add bash \
	&& apk add libexecinfo libexecinfo-dev \
	&& apk add --no-cache --virtual build-dependencies build-base \
	snappy dos2unix g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python2 py2-setuptools vips-dev git \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& mkdir /srv/ever && chown -R node:node /srv/ever

COPY wait .deploy/api/entrypoint.compose.sh .deploy/api/entrypoint.prod.sh /
RUN chmod +x /wait /entrypoint.compose.sh /entrypoint.prod.sh && dos2unix /entrypoint.compose.sh && dos2unix /entrypoint.prod.sh

USER node:node

WORKDIR /srv/ever

COPY --chown=node:node package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY --chown=node:node packages/core/package.json ./packages/core/package.json
COPY --chown=node:node packages/common/package.json ./packages/common/package.json
COPY --chown=node:node .snyk ./.snyk
COPY --chown=node:node packages/core/.snyk ./packages/core/.snyk

RUN yarn bootstrap && yarn cache clean

FROM node:16-alpine3.11 AS development

USER node:node

WORKDIR /srv/ever

COPY --chown=node:node --from=dependencies /wait /entrypoint.compose.sh /entrypoint.prod.sh /
COPY --chown=node:node --from=dependencies /srv/ever .
COPY . .

FROM node:16-alpine3.11 AS build

WORKDIR /srv/ever

RUN mkdir dist

COPY --chown=node:node --from=development /srv/ever .

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV DEMO=${DEMO:-false}

ENV IS_DOCKER=true

RUN yarn build:server

FROM node:16-alpine3.11 AS production

WORKDIR /srv/ever

COPY --chown=node:node --from=dependencies /wait /entrypoint.prod.sh /entrypoint.compose.sh ./
COPY --chown=node:node --from=dependencies /srv/ever/node_modules ./node_modules
COPY --chown=node:node --from=build /srv/ever/packages/common/ ./packages/common/
COPY --chown=node:node --from=build /srv/ever/packages/core/ ./packages/core/

RUN chmod +x wait entrypoint.compose.sh entrypoint.prod.sh

RUN npm install cross-env -g \
	&& npm install pm2 -g --unsafe-perm \
	&& touch ormlogs.log && chown node:node ormlogs.log \
	&& chown node:node wait && chmod +x wait

# Temporary install MongoDB inside container
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories
RUN apk update
RUN apk add --no-cache mongodb

RUN mkdir /data
RUN cd /data && mkdir db

RUN chown -R mongodb /data/db
RUN chmod -R a+wxr /data
RUN chown -R node:node /data

VOLUME /data/db

RUN mkdir tmp && cd tmp && mkdir logs && cd /srv/ever && chown -R node:node tmp/logs

USER node:node

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV API_HOST=${API_HOST:-api}
ENV API_PORT=${API_PORT:-5500}
ENV API_BASE_URL=${API_BASE_URL:-http://localhost:5500}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV DB_URI=${DB_URI:-mongodb://localhost/ever_development}
ENV DB_HOST=${DB_HOST:-localhost}
ENV DB_NAME=${DB_NAME:-ever_development}
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

EXPOSE ${PORT} 5501 5050 5555 27017 28017

ENTRYPOINT [ "./entrypoint.prod.sh" ]

# CMD [ "pm2-runtime", "main.js" ]
CMD [ "node", "packages/core/build/src/main.js" ]