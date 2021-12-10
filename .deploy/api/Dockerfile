# Ever Demand Platform API (Core)

ARG NODE_OPTIONS
ARG NODE_ENV
ARG API_BASE_URL
ARG API_HOST
ARG API_PORT
ARG HTTPPORT
ARG HTTPSPORT
ARG GQLPORT
ARG GQLPORT_SUBSCRIPTIONS
ARG STRIPE_SECRET_KEY
ARG URBAN_AIRSHIP_KEY
ARG URBAN_AIRSHIP_SECRET
ARG KEYMETRICS_MACHINE_NAME
ARG KEYMETRICS_SECRET_KEY
ARG KEYMETRICS_PUBLIC_KEY
ARG GOOGLE_APP_ID
ARG GOOGLE_APP_SECRET
ARG FACEBOOK_APP_ID
ARG FACEBOOK_APP_SECRET
ARG JWT_SECRET
ARG EXPRESS_SESSION_SECRET
ARG SETTING_INVITES_ENABLED
ARG SETTINGS_REGISTRATIONS_REQUIRED_ON_START
ARG ADMIN_PASSWORD_RESET
ARG FAKE_DATA_GENERATOR
ARG ARCGIS_CLIENT_ID
ARG ARCGIS_CLIENT_SECRET
ARG IP_STACK_API_KEY
ARG ENGINE_API_KEY
ARG SENTRY_DSN
ARG DB_URI
ARG DB_HOST
ARG DB_NAME
ARG DB_PORT
ARG DB_USER
ARG DB_PASS
ARG DB_TYPE
ARG DB_SSL_MODE
ARG DB_CA_CERT
ARG DEMO
ARG HOST
ARG PORT
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION
ARG AWS_S3_BUCKET
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET
ARG CLOUDINARY_CLOUD_NAME
ARG MAIL_FROM_ADDRESS
ARG MAIL_HOST
ARG MAIL_PORT
ARG MAIL_USERNAME
ARG MAIL_PASSWORD
ARG ALLOW_SUPER_ADMIN_ROLE
ARG GOOGLE_CALLBACK_URL
ARG FACEBOOK_GRAPH_VERSION
ARG FACEBOOK_CALLBACK_URL
ARG UNLEASH_APP_NAME
ARG UNLEASH_API_URL
ARG UNLEASH_INSTANCE_ID
ARG UNLEASH_REFRESH_INTERVAL
ARG UNLEASH_METRICS_INTERVAL

FROM node:16-alpine3.14 AS dependencies

LABEL maintainer="ever@ever.co"
LABEL org.opencontainers.image.source https://github.com/ever-co/ever-demand

ENV CI=true

RUN apk --update add bash \
	&& apk add libexecinfo libexecinfo-dev \
	&& npm i -g npm \
	&& apk add --no-cache --virtual build-dependencies build-base \
	snappy dos2unix g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python2 py2-setuptools vips-dev git \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& npm install yarn -g --force \
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

FROM node:16-alpine3.14 AS development

USER node:node

WORKDIR /srv/ever

COPY --chown=node:node --from=dependencies /wait /entrypoint.compose.sh /entrypoint.prod.sh /
COPY --chown=node:node --from=dependencies /srv/ever .
COPY . .

FROM node:16-alpine3.14 AS build

WORKDIR /srv/ever

RUN mkdir dist

COPY --chown=node:node --from=development /srv/ever .

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV DEMO=${DEMO:-false}

ENV IS_DOCKER=true

RUN yarn build:server

FROM node:16-alpine3.14 AS production

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

RUN mkdir tmp && cd tmp && mkdir logs && cd /srv/ever && chown -R node:node tmp/logs

USER node:node

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV API_HOST=${API_HOST:-api}
ENV API_PORT=${API_PORT:-5500}
ENV API_BASE_URL=${API_BASE_URL:-http://localhost:5500}
ENV HTTPPORT=${HTTPPORT:-5500}
ENV HTTPSPORT=${HTTPSPORT:-2087}
ENV GQLPORT=${GQLPORT:-8443}
ENV GQLPORT_SUBSCRIPTIONS=${GQLPORT_SUBSCRIPTIONS:-2086}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV URBAN_AIRSHIP_KEY=${URBAN_AIRSHIP_KEY}
ENV URBAN_AIRSHIP_SECRET=${URBAN_AIRSHIP_SECRET}
ENV KEYMETRICS_MACHINE_NAME=${KEYMETRICS_MACHINE_NAME}
ENV KEYMETRICS_SECRET_KEY=${KEYMETRICS_SECRET_KEY}
ENV KEYMETRICS_PUBLIC_KEY=${KEYMETRICS_PUBLIC_KEY}
ENV GOOGLE_APP_ID=${GOOGLE_APP_ID}
ENV GOOGLE_APP_SECRET=${GOOGLE_APP_SECRET}
ENV FACEBOOK_APP_ID=${FACEBOOK_APP_ID}
ENV FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET}
ENV JWT_SECRET=${JWT_SECRET:-secretKey}
ENV EXPRESS_SESSION_SECRET=${EXPRESS_SESSION_SECRET:-demand}
ENV SETTING_INVITES_ENABLED=${SETTING_INVITES_ENABLED:-false}
ENV SETTINGS_REGISTRATIONS_REQUIRED_ON_START=${SETTINGS_REGISTRATIONS_REQUIRED_ON_START:-false}
ENV ADMIN_PASSWORD_RESET=${ADMIN_PASSWORD_RESET}
ENV FAKE_DATA_GENERATOR=${FAKE_DATA_GENERATOR}
ENV ARCGIS_CLIENT_ID=${ARCGIS_CLIENT_ID}
ENV ARCGIS_CLIENT_SECRET=${ARCGIS_CLIENT_SECRET}
ENV IP_STACK_API_KEY=${IP_STACK_API_KEY}
ENV ENGINE_API_KEY=${ENGINE_API_KEY}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV DB_URI=${DB_URI:-mongodb://localhost/ever_development}
ENV DB_HOST=${DB_HOST:-localhost}
ENV DB_NAME=${DB_NAME:-ever_development}
ENV DB_PORT=${DB_PORT:-27017}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}
ENV DB_TYPE=${DB_TYPE:-mongodb}
ENV DB_SSL_MODE=${DB_SSL_MODE}
ENV DB_CA_CERT=${DB_CA_CERT}
ENV HOST=${HOST:-0.0.0.0}
ENV PORT=${PORT:-5500}
ENV DEMO=${DEMO:-false}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_S3_BUCKET=${AWS_S3_BUCKET}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
ENV MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS}
ENV MAIL_HOST=${MAIL_HOST}
ENV MAIL_PORT=${MAIL_PORT}
ENV MAIL_USERNAME=${MAIL_USERNAME}
ENV MAIL_PASSWORD=${MAIL_PASSWORD}
ENV ALLOW_SUPER_ADMIN_ROLE=${ALLOW_SUPER_ADMIN_ROLE}
ENV GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
ENV FACEBOOK_GRAPH_VERSION=${FACEBOOK_GRAPH_VERSION}
ENV FACEBOOK_CALLBACK_URL=${FACEBOOK_CALLBACK_URL}
ENV UNLEASH_APP_NAME=${UNLEASH_APP_NAME}
ENV UNLEASH_API_URL=${UNLEASH_API_URL}
ENV UNLEASH_INSTANCE_ID=${UNLEASH_INSTANCE_ID}
ENV UNLEASH_REFRESH_INTERVAL=${UNLEASH_REFRESH_INTERVAL}
ENV UNLEASH_METRICS_INTERVAL=${UNLEASH_METRICS_INTERVAL}

# 5500 for HTTP
# 2087 for HTTPS
# 8443 for GraphQL
# 2086 for GraphQL Subscriptions (WebSockets)

EXPOSE ${HTTPPORT} ${HTTPSPORT} ${GQLPORT} ${GQLPORT_SUBSCRIPTIONS}

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "pm2-runtime", "packages/core/build/main.js" ]
# CMD [ "node", "packages/core/build/main.js" ]
