# Ever Demand Platform Carrier Mobile App (Ionic + Angular), served by nginx
#
# Build from the repository root:
#   docker build -f .deploy/carrier-mobile-ionic/Dockerfile -t ever-carrier-mobile .
# The build context filter is .deploy/carrier-mobile-ionic/Dockerfile.dockerignore (BuildKit).

FROM node:26-alpine AS build

LABEL maintainer="ever@ever.co"
LABEL org.opencontainers.image.source=https://github.com/ever-co/ever-demand

ENV CI=true
# husky (root `prepare` script) has nothing to do in an image
ENV HUSKY=0

# Node 25+ no longer bundles corepack
RUN npm i -g pnpm@12.23.0

WORKDIR /srv/ever

# Prefer the internal Verdaccio cache when VERDACCIO_REGISTRY is set (anonymous); empty (e.g. a fork)
# falls back to the public npm registry.
ARG VERDACCIO_REGISTRY=""
RUN if [ -n "$VERDACCIO_REGISTRY" ]; then echo "registry=${VERDACCIO_REGISTRY}" >> /srv/ever/.npmrc; fi

# Install only what the carrier app and the shared packages it compiles from source need.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .npmrc ./
COPY patches ./patches
COPY packages/common/package.json packages/common/
COPY packages/common-angular/package.json packages/common-angular/
COPY packages/carrier-mobile-ionic/package.json packages/carrier-mobile-ionic/
RUN pnpm install --frozen-lockfile --filter "@ever-platform/carrier-mobile-ionic..."

COPY packages/common packages/common
COPY packages/common-angular packages/common-angular
COPY packages/carrier-mobile-ionic packages/carrier-mobile-ionic

# Settings for scripts/configure.ts (all optional; see packages/carrier-mobile-ionic/.env.template).
# They end up in the browser bundle, so never pass secrets here.
ARG GQL_ENDPOINT
# Multi-tenant: a white-label build for one tenant (slug or id), and the parent domain
# of <slug>.<TENANT_BASE_DOMAIN> hosts (docs/multi-tenant/DESIGN.md §3.3); both optional.
ARG TENANT
ARG TENANT_BASE_DOMAIN
ARG GQL_SUBSCRIPTIONS_ENDPOINT
ARG SERVICES_ENDPOINT
ARG HTTPS_SERVICES_ENDPOINT
ARG GOOGLE_MAPS_API_KEY
ARG GOOGLE_ANALYTICS_API_KEY
ARG MIXPANEL_API_KEY
ARG DEFAULT_LATITUDE
ARG DEFAULT_LONGITUDE
ARG DEFAULT_LANGUAGE
ARG DEFAULT_CUSTOMER_LOGO
ARG DEFAULT_LOGIN_USERNAME
ARG DEFAULT_LOGIN_PASSWORD
ARG LOGIN_LOGO
ARG NO_INTERNET_LOGO
ARG COMPANY_NAME
ARG APP_NAME
ARG SETTINGS_APP_TYPE
ARG SETTINGS_MAINTENANCE_API_URL

ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NODE_ENV=production
ENV IS_DOCKER=true

RUN pnpm --filter @ever-platform/carrier-mobile-ionic build

FROM nginx:alpine AS production

WORKDIR /srv/ever

COPY --chown=nginx:nginx wait .deploy/carrier-mobile-ionic/entrypoint.compose.sh .deploy/carrier-mobile-ionic/entrypoint.prod.sh ./
COPY --chown=nginx:nginx .deploy/carrier-mobile-ionic/nginx.compose.conf /etc/nginx/conf.d/compose.conf.template
COPY --chown=nginx:nginx .deploy/carrier-mobile-ionic/nginx.prod.conf /etc/nginx/conf.d/prod.conf.template
COPY --chown=nginx:nginx --from=build /srv/ever/packages/carrier-mobile-ionic/www .

RUN apk add --no-cache dos2unix \
	&& dos2unix entrypoint.compose.sh entrypoint.prod.sh \
	&& chmod +x wait entrypoint.compose.sh entrypoint.prod.sh \
	&& chmod 644 /etc/nginx/conf.d/compose.conf.template /etc/nginx/conf.d/prod.conf.template

ENV API_HOST=api
ENV API_PORT=3000
ENV API_BASE_URL=http://localhost:3000
ENV CLIENT_BASE_URL=http://localhost:4203
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=4203
ENV DEMO=false

EXPOSE 4203

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]
