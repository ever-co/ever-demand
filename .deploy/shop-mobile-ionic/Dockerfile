# Ever Demand Platform Shop Mobile App (Ionic)

ARG API_BASE_URL
ARG API_HOST
ARG API_PORT
ARG CLIENT_BASE_URL
ARG DEMO
ARG WEB_HOST
ARG WEB_PORT
ARG HTTPS_SERVICES_ENDPOINT
ARG SERVICES_ENDPOINT
ARG GQL_ENDPOINT
ARG GQL_SUBSCRIPTIONS_ENDPOINT
ARG SENTRY_DSN
ARG CHATWOOT_SDK_TOKEN
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG GOOGLE_MAPS_API_KEY
ARG GOOGLE_ANALYTICS_API_KEY
ARG GOOGLE_PLACE_AUTOCOMPLETE
ARG DEFAULT_LATITUDE
ARG DEFAULT_LONGITUDE
ARG DEFAULT_CURRENCY
ARG DEFAULT_LANGUAGE
ARG DEFAULT_CUSTOMER_LOGO
ARG LOGIN_LOGO
ARG NO_INTERNET_LOGO
ARG COMPANY_NAME
ARG APP_NAME
ARG MIXPANEL_API_KEY
ARG DEFAULT_LOGIN_USERNAME
ARG DEFAULT_LOGIN_PASSWORD
ARG SETTINGS_APP_TYPE
ARG SETTINGS_MAINTENANCE_API_URL

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

COPY wait .deploy/shop-mobile-ionic/entrypoint.compose.sh .deploy/shop-mobile-ionic/entrypoint.prod.sh /

RUN chmod +x /wait /entrypoint.compose.sh /entrypoint.prod.sh && dos2unix /entrypoint.compose.sh && dos2unix /entrypoint.prod.sh

USER node:node

WORKDIR /srv/ever

COPY --chown=node:node package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY --chown=node:node packages/shop-mobile-ionic/package.json ./packages/shop-mobile-ionic/package.json
COPY --chown=node:node .snyk ./.snyk
COPY --chown=node:node packages/common/package.json ./packages/common/package.json
COPY --chown=node:node packages/common-angular/package.json ./packages/common-angular/package.json

RUN yarn bootstrap && yarn cache clean

FROM node:16-alpine3.14 AS development

USER node:node

WORKDIR /srv/ever

COPY --chown=node:node --from=dependencies /wait /entrypoint.compose.sh /entrypoint.prod.sh /
COPY --chown=node:node --from=dependencies /srv/ever .
COPY . .

FROM node:16-alpine3.14 AS build

WORKDIR /srv/ever

RUN mkdir www

COPY --chown=node:node --from=development /srv/ever .

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"}
ENV NODE_ENV=${NODE_ENV:-production}

ENV IS_DOCKER=true

RUN yarn build:shopmobile

FROM nginx:alpine AS production

# USER nginx:nginx

WORKDIR /srv/ever

COPY --chown=nginx:nginx --from=dependencies /wait /entrypoint.prod.sh /entrypoint.compose.sh ./
COPY --chown=nginx:nginx .deploy/shop-mobile-ionic/nginx.compose.conf /etc/nginx/conf.d/compose.conf.template
COPY --chown=nginx:nginx .deploy/shop-mobile-ionic/nginx.prod.conf /etc/nginx/conf.d/prod.conf.template
COPY --chown=nginx:nginx --from=build /srv/ever/packages/shop-mobile-ionic/www .

RUN chmod +x wait entrypoint.compose.sh entrypoint.prod.sh && \
    chmod a+rw /etc/nginx/conf.d/compose.conf.template /etc/nginx/conf.d/prod.conf.template

ENV API_HOST=${API_HOST:-api}
ENV API_PORT=${API_PORT:-3000}

ENV API_BASE_URL=${API_BASE_URL:-http://localhost:3000}
ENV CLIENT_BASE_URL=${CLIENT_BASE_URL:-http://localhost:4201}
ENV WEB_HOST=${WEB_HOST:-0.0.0.0}
ENV WEB_PORT=${WEB_PORT:-4201}
ENV DEMO=${DEMO:-false}

ENV HTTPS_SERVICES_ENDPOINT=${HTTPS_SERVICES_ENDPOINT}
ENV SERVICES_ENDPOINT=${SERVICES_ENDPOINT}
ENV GQL_ENDPOINT=${GQL_ENDPOINT}
ENV GQL_SUBSCRIPTIONS_ENDPOINT=${GQL_SUBSCRIPTIONS_ENDPOINT}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV CHATWOOT_SDK_TOKEN=${CHATWOOT_SDK_TOKEN}
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
ENV GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
ENV GOOGLE_ANALYTICS_API_KEY=${GOOGLE_ANALYTICS_API_KEY}
ENV GOOGLE_PLACE_AUTOCOMPLETE=${GOOGLE_PLACE_AUTOCOMPLETE:-false}
ENV DEFAULT_LATITUDE=${DEFAULT_LATITUDE:-42.6459136}
ENV DEFAULT_LONGITUDE=${DEFAULT_LONGITUDE:-23.3332736}
ENV DEFAULT_CURRENCY=${DEFAULT_CURRENCY:-USD}_DSN}
ENV DEFAULT_LANGUAGE=${DEFAULT_LANGUAGE:-en}
ENV DEFAULT_CUSTOMER_LOGO=${DEFAULT_CUSTOMER_LOGO}
ENV LOGIN_LOGO=${LOGIN_LOGO}
ENV NO_INTERNET_LOGO=${NO_INTERNET_LOGO}
ENV COMPANY_NAME=${COMPANY_NAME}
ENV APP_NAME=${APP_NAME}
ENV MIXPANEL_API_KEY=${MIXPANEL_API_KEY}
ENV DEFAULT_LOGIN_USERNAME=${DEFAULT_LOGIN_USERNAME}
ENV DEFAULT_LOGIN_PASSWORD=${DEFAULT_LOGIN_PASSWORD}
ENV SETTINGS_APP_TYPE=${SETTINGS_APP_TYPE}
ENV SETTINGS_MAINTENANCE_API_URL=${SETTINGS_MAINTENANCE_API_URL}

EXPOSE ${WEB_PORT}

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]
