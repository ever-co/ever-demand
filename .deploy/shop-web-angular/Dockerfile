# Ever Demand Platform Shop Web (Angular)
#
# Build from the repository root:
#   docker build -f .deploy/shop-web-angular/Dockerfile -t ever-shop-web .
#
# The endpoints are baked into the bundle at build time (scripts/configure.ts reads the env),
# so pass them as build args, e.g. --build-arg GQL_ENDPOINT=https://api.example.com/graphql.
# The image serves the static app (dist/browser) with nginx on port 4200.

ARG NODE_IMAGE=node:26-alpine

FROM ${NODE_IMAGE} AS build

LABEL maintainer="ever@ever.co"
LABEL org.opencontainers.image.source=https://github.com/ever-co/ever-demand

ENV CI=true
# husky (the root "prepare" script) has no git hooks to install in an image
ENV HUSKY=0

# Node 25+ no longer bundles corepack
# pnpm runs without its own install scripts (lifecycle scripts stay off: Sonar S6505)
RUN npm i -g --ignore-scripts pnpm@12.23.0

WORKDIR /srv/ever

# Prefer the internal Verdaccio cache when VERDACCIO_REGISTRY is set (anonymous, backward-compatible);
# empty (e.g. a fork) falls back to public npm.
ARG VERDACCIO_REGISTRY=""
RUN if [ -n "$VERDACCIO_REGISTRY" ]; then \
		echo "registry=${VERDACCIO_REGISTRY}" >> /srv/ever/.npmrc; \
	fi

# Manifests first, so the install layer is cached while only sources change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY patches ./patches
COPY packages/common/package.json packages/common/
COPY packages/common-angular/package.json packages/common-angular/
COPY packages/shop-web-angular/package.json packages/shop-web-angular/

RUN pnpm install --frozen-lockfile --filter "@ever-platform/shop-web-angular..."

COPY packages/common packages/common
COPY packages/common-angular packages/common-angular
COPY packages/shop-web-angular packages/shop-web-angular

ARG DEFAULT_LATITUDE
ARG DEFAULT_LONGITUDE
ARG DEFAULT_LANGUAGE
ARG SERVICES_ENDPOINT
ARG HTTPS_SERVICES_ENDPOINT
ARG GQL_ENDPOINT
# Multi-tenant: a white-label build for one tenant (slug or id), and the parent domain
# of <slug>.<TENANT_BASE_DOMAIN> hosts (docs/multi-tenant/DESIGN.md §3.3); both optional.
ARG TENANT
ARG TENANT_BASE_DOMAIN
ARG GQL_SUBSCRIPTIONS_ENDPOINT
ARG AUTH_LOGO
ARG NO_INTERNET_LOGO
ARG GOOGLE_MAPS_API_KEY
ARG DELIVERY_TIME_MIN
ARG DELIVERY_TIME_MAX
ARG SETTINGS_APP_TYPE
ARG SETTINGS_MAINTENANCE_API_URL

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# configure.ts treats an empty variable as unset and uses its default
RUN DEFAULT_LATITUDE="${DEFAULT_LATITUDE}" DEFAULT_LONGITUDE="${DEFAULT_LONGITUDE}" \
	DEFAULT_LANGUAGE="${DEFAULT_LANGUAGE}" \
	SERVICES_ENDPOINT="${SERVICES_ENDPOINT}" HTTPS_SERVICES_ENDPOINT="${HTTPS_SERVICES_ENDPOINT}" \
	GQL_ENDPOINT="${GQL_ENDPOINT}" GQL_SUBSCRIPTIONS_ENDPOINT="${GQL_SUBSCRIPTIONS_ENDPOINT}" \
	AUTH_LOGO="${AUTH_LOGO}" NO_INTERNET_LOGO="${NO_INTERNET_LOGO}" \
	GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}" \
	DELIVERY_TIME_MIN="${DELIVERY_TIME_MIN}" DELIVERY_TIME_MAX="${DELIVERY_TIME_MAX}" \
	SETTINGS_APP_TYPE="${SETTINGS_APP_TYPE}" SETTINGS_MAINTENANCE_API_URL="${SETTINGS_MAINTENANCE_API_URL}" \
	pnpm --filter @ever-platform/shop-web-angular run build

FROM nginx:alpine AS production

WORKDIR /srv/ever

RUN apk add --no-cache dos2unix

# Owned by root, read-only for the nginx workers: the entrypoint runs as root (it fills in
# the runtime settings and writes /etc/nginx/nginx.conf), nothing else writes here (Sonar S6504).
COPY wait .deploy/shop-web-angular/entrypoint.prod.sh .deploy/shop-web-angular/entrypoint.compose.sh ./
COPY .deploy/shop-web-angular/nginx.compose.conf /etc/nginx/conf.d/compose.conf.template
COPY .deploy/shop-web-angular/nginx.prod.conf /etc/nginx/conf.d/prod.conf.template
COPY --from=build /srv/ever/packages/shop-web-angular/dist/browser .

RUN dos2unix entrypoint.prod.sh entrypoint.compose.sh && \
	chmod +x wait entrypoint.compose.sh entrypoint.prod.sh && \
	chmod 644 /etc/nginx/conf.d/compose.conf.template /etc/nginx/conf.d/prod.conf.template

ENV API_HOST=api
ENV API_PORT=3000
ENV WEB_PORT=4200

EXPOSE 4200

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]
