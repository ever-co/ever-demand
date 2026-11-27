# Ever Demand Platform Shop Mobile App (Ionic / Angular), web build served by nginx.
# Build from the repository root:
#   docker build -f .deploy/shop-mobile-ionic/Dockerfile -t ever-demand-shop-mobile .
# The native Android / iOS apps are built with Capacitor instead (see
# docs/latest-stack/shop-mobile-ionic.md).

FROM node:26-alpine AS build

LABEL maintainer="ever@ever.co"
LABEL org.opencontainers.image.source=https://github.com/ever-co/ever-demand

# Settings baked into the generated environment.ts (scripts/env.ts). All of them are public:
# the app runs in the browser.
ARG SERVICES_ENDPOINT
ARG HTTPS_SERVICES_ENDPOINT
ARG GQL_ENDPOINT
# Multi-tenant: a white-label build for one tenant (slug or id), and the parent domain
# of <slug>.<TENANT_BASE_DOMAIN> hosts (docs/multi-tenant/DESIGN.md §3.3); both optional.
ARG TENANT
ARG TENANT_BASE_DOMAIN
ARG GQL_SUBSCRIPTIONS_ENDPOINT
ARG GOOGLE_MAPS_API_KEY
ARG GOOGLE_ANALYTICS_API_KEY
ARG STRIPE_PUBLISHABLE_KEY
ARG DEFAULT_LATITUDE
ARG DEFAULT_LONGITUDE
ARG DEFAULT_LANGUAGE
ARG DEFAULT_LOCALE
ARG NO_INTERNET_LOGO
ARG INVITE_BY_CODE_LOGO
ARG COMPANY_NAME
ARG MIXPANEL_API_KEY
ARG PRODUCTS_VIEW_TYPE
ARG ORDER_INFO_TYPE
ARG SUPPORT_NUMBER
ARG MERCHANT_IDS
ARG SHOPPING_CART
ARG SETTINGS_APP_TYPE
ARG SETTINGS_MAINTENANCE_API_URL

# Prefer the internal Verdaccio cache when VERDACCIO_REGISTRY is set (anonymous); empty
# (e.g. a fork) falls back to the public npm registry.
ARG VERDACCIO_REGISTRY=""

ENV CI=true
ENV NODE_OPTIONS=--max-old-space-size=4096

# Node 25+ no longer bundles corepack.
# pnpm runs without its own install scripts (lifecycle scripts stay off: Sonar S6505)
RUN npm i -g --ignore-scripts pnpm@12.23.0

WORKDIR /srv/ever

# Workspace manifests first, so the install layer is cached until a manifest changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY patches ./patches
COPY packages/common/package.json packages/common/package.json
COPY packages/common-angular/package.json packages/common-angular/package.json
COPY packages/shop-mobile-ionic/package.json packages/shop-mobile-ionic/package.json

RUN if [ -n "$VERDACCIO_REGISTRY" ]; then echo "registry=${VERDACCIO_REGISTRY}" >> .npmrc; fi \
	&& pnpm install --frozen-lockfile \
		--filter "@ever-platform/shop-mobile-ionic..."

COPY packages/common packages/common
COPY packages/common-angular packages/common-angular
COPY packages/shop-mobile-ionic packages/shop-mobile-ionic

RUN SERVICES_ENDPOINT="${SERVICES_ENDPOINT:-http://localhost:5500}" \
	HTTPS_SERVICES_ENDPOINT="${HTTPS_SERVICES_ENDPOINT:-https://localhost:2087}" \
	GQL_ENDPOINT="${GQL_ENDPOINT:-http://localhost:8443/graphql}" \
	GQL_SUBSCRIPTIONS_ENDPOINT="${GQL_SUBSCRIPTIONS_ENDPOINT:-ws://localhost:2086/subscriptions}" \
	GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}" \
	GOOGLE_ANALYTICS_API_KEY="${GOOGLE_ANALYTICS_API_KEY}" \
	STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}" \
	DEFAULT_LATITUDE="${DEFAULT_LATITUDE:-42.6459136}" \
	DEFAULT_LONGITUDE="${DEFAULT_LONGITUDE:-23.3332736}" \
	DEFAULT_LANGUAGE="${DEFAULT_LANGUAGE:-en-US}" \
	DEFAULT_LOCALE="${DEFAULT_LOCALE:-en-US}" \
	NO_INTERNET_LOGO="${NO_INTERNET_LOGO:-assets/imgs/logo.png}" \
	INVITE_BY_CODE_LOGO="${INVITE_BY_CODE_LOGO:-assets/imgs/ever-logo.svg}" \
	COMPANY_NAME="${COMPANY_NAME:-Ever Co. LTD}" \
	MIXPANEL_API_KEY="${MIXPANEL_API_KEY}" \
	PRODUCTS_VIEW_TYPE="${PRODUCTS_VIEW_TYPE:-slides}" \
	ORDER_INFO_TYPE="${ORDER_INFO_TYPE:-page}" \
	SUPPORT_NUMBER="${SUPPORT_NUMBER:-0888888888}" \
	MERCHANT_IDS="${MERCHANT_IDS:-[]}" \
	SHOPPING_CART="${SHOPPING_CART:-false}" \
	SETTINGS_APP_TYPE="${SETTINGS_APP_TYPE:-shop-mobile}" \
	SETTINGS_MAINTENANCE_API_URL="${SETTINGS_MAINTENANCE_API_URL}" \
	pnpm --filter @ever-platform/shop-mobile-ionic run build:prod

FROM nginx:alpine AS production

WORKDIR /srv/ever

# Owned by root, read-only for the nginx workers: the entrypoint runs as root (it fills in
# the runtime settings and writes /etc/nginx/nginx.conf), nothing else writes here (Sonar S6504).
COPY wait .deploy/shop-mobile-ionic/entrypoint.compose.sh .deploy/shop-mobile-ionic/entrypoint.prod.sh ./
COPY .deploy/shop-mobile-ionic/nginx.compose.conf /etc/nginx/conf.d/compose.conf.template
COPY .deploy/shop-mobile-ionic/nginx.prod.conf /etc/nginx/conf.d/prod.conf.template
COPY --from=build /srv/ever/packages/shop-mobile-ionic/www .

RUN apk add --no-cache dos2unix \
	&& dos2unix entrypoint.compose.sh entrypoint.prod.sh \
	&& chmod +x wait entrypoint.compose.sh entrypoint.prod.sh \
	&& chmod 644 /etc/nginx/conf.d/compose.conf.template /etc/nginx/conf.d/prod.conf.template

ENV API_HOST=api
ENV API_PORT=3000
ENV API_BASE_URL=http://localhost:3000
ENV CLIENT_BASE_URL=http://localhost:4201
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=4201
ENV DEMO=false

EXPOSE 4201

ENTRYPOINT [ "./entrypoint.prod.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]
