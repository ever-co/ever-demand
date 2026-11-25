# Ever Demand Platform Admin UI (Angular 22, pnpm workspace)
#
# Build from the repository root:
#   docker build -f .deploy/admin-web-angular/Dockerfile -t ever-demand-admin .
#
# The image is built once and configured at start: the build writes DOCKER_<KEY> placeholders into
# the Angular environment (IS_DOCKER=true) and entrypoint.*.sh replaces them with the container's
# environment variables before nginx starts.

ARG NODE_VERSION=26
ARG PNPM_VERSION=12.23.0

FROM node:${NODE_VERSION}-alpine AS build

ARG PNPM_VERSION
# Prefer an internal Verdaccio cache when VERDACCIO_REGISTRY is set; empty falls back to npmjs.
ARG VERDACCIO_REGISTRY=""

LABEL maintainer="ever@ever.co"
LABEL org.opencontainers.image.source=https://github.com/ever-co/ever-demand

ENV CI=true
# husky (root "prepare" script) is a no-op in the image
ENV HUSKY=0

# Node 25+ no longer bundles corepack: install pnpm directly.
RUN npm i -g pnpm@${PNPM_VERSION} \
	&& if [ -n "$VERDACCIO_REGISTRY" ]; then npm config set registry "$VERDACCIO_REGISTRY"; fi

WORKDIR /srv/ever

# Sources (filtered by Dockerfile.dockerignore), then an install of only the admin and the
# workspace packages it compiles from source (common, common-angular).
COPY . .
RUN pnpm install --frozen-lockfile --filter "@ever-platform/admin-web-angular..."

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV IS_DOCKER=true

RUN pnpm --filter @ever-platform/admin-web-angular build

FROM nginx:alpine AS production

WORKDIR /srv/ever

COPY --chown=nginx:nginx wait .deploy/admin-web-angular/entrypoint.compose.sh .deploy/admin-web-angular/entrypoint.prod.sh ./
COPY --chown=nginx:nginx .deploy/admin-web-angular/nginx.compose.conf /etc/nginx/conf.d/compose.conf.template
COPY --chown=nginx:nginx .deploy/admin-web-angular/nginx.prod.conf /etc/nginx/conf.d/prod.conf.template
COPY --chown=nginx:nginx --from=build /srv/ever/packages/admin-web-angular/dist .

RUN apk add --no-cache dos2unix \
	&& dos2unix entrypoint.compose.sh entrypoint.prod.sh \
	&& chmod +x wait entrypoint.compose.sh entrypoint.prod.sh \
	&& chmod a+rw /etc/nginx/conf.d/compose.conf.template /etc/nginx/conf.d/prod.conf.template

ENV API_HOST=api
ENV API_PORT=3000

ENV API_BASE_URL=http://localhost:3000
ENV CLIENT_BASE_URL=http://localhost:4200
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=4200
ENV DEMO=false

ENV HTTPS_SERVICES_ENDPOINT=https://localhost:2087
ENV SERVICES_ENDPOINT=http://localhost:5500
ENV GQL_ENDPOINT=http://localhost:8443/graphql
ENV GQL_SUBSCRIPTIONS_ENDPOINT=ws://localhost:2086/subscriptions
ENV GOOGLE_MAPS_API_KEY=
ENV GOOGLE_PLACE_AUTOCOMPLETE=false
ENV DEFAULT_LATITUDE=42.6459136
ENV DEFAULT_LONGITUDE=23.3332736
ENV DEFAULT_CURRENCY=USD
ENV DEFAULT_LANGUAGE=en-US
ENV CURRENCY_SYMBOL="\$"
ENV NO_INTERNET_LOGO=assets/images/ever-logo.svg
ENV MAP_MERCHANT_ICON_LINK=http://maps.google.com/mapfiles/kml/pal3/icon21.png
ENV MAP_USER_ICON_LINK=http://maps.google.com/mapfiles/kml/pal3/icon48.png
ENV MAP_CARRIER_ICON_LINK=http://maps.google.com/mapfiles/kml/pal4/icon54.png
ENV API_FILE_UPLOAD_URL=https://api.cloudinary.com/v1_1/evereq/upload
ENV COMPANY_NAME="Ever Co. LTD"
ENV COMPANY_SITE_LINK=https://ever.co/
ENV COMPANY_GITHUB_LINK=https://github.com/ever-co
ENV COMPANY_FACEBOOK_LINK=https://www.facebook.com/evercoapp
ENV COMPANY_TWITTER_LINK=https://twitter.com/evercoapp
ENV COMPANY_LINKEDIN_LINK=https://www.linkedin.com/company/ever-co.
ENV GENERATE_PASSWORD_CHARSET="abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$_"
ENV SETTINGS_APP_TYPE=admin
ENV SETTINGS_MAINTENANCE_API_URL=

EXPOSE 4200

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]
