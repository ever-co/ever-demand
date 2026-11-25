# Ever Demand shop app, Expo web build (react-native-web) served by nginx.
#
# EXPO_PUBLIC_* values are inlined into the bundle at build time, so pass them as build args:
#   docker build -f .deploy/shop-mobile-expo/Dockerfile \
#     --build-arg EXPO_PUBLIC_SERVICES_ENDPOINT=https://api.example.com \
#     --build-arg EXPO_PUBLIC_GQL_ENDPOINT=https://api.example.com/graphql \
#     --build-arg EXPO_PUBLIC_GQL_SUBSCRIPTIONS_ENDPOINT=wss://api.example.com/subscriptions \
#     -t ever-shop-expo .
# Native (iOS / Android) builds go through EAS or `expo prebuild`, not this image.

FROM node:26-alpine AS build

LABEL maintainer="ever@ever.co"
LABEL org.opencontainers.image.source=https://github.com/ever-co/ever-demand

ENV CI=true

# Node 25+ no longer bundles corepack.
RUN npm i -g pnpm@12.23.0

WORKDIR /srv/ever

# Prefer the internal Verdaccio cache when VERDACCIO_REGISTRY is set; empty falls back to public npm.
ARG VERDACCIO_REGISTRY=""
RUN if [ -n "$VERDACCIO_REGISTRY" ]; then echo "registry=${VERDACCIO_REGISTRY}" >> /srv/ever/.npmrc; fi

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/shop-mobile-expo/package.json ./packages/shop-mobile-expo/package.json

RUN pnpm install --frozen-lockfile --filter @ever-platform/shop-mobile-expo...

COPY packages/shop-mobile-expo ./packages/shop-mobile-expo

ARG EXPO_PUBLIC_PRODUCTION=true
ARG EXPO_PUBLIC_SERVICES_ENDPOINT=http://localhost:5500
ARG EXPO_PUBLIC_GQL_ENDPOINT=http://localhost:8443/graphql
ARG EXPO_PUBLIC_GQL_SUBSCRIPTIONS_ENDPOINT=ws://localhost:2086/subscriptions
ARG EXPO_PUBLIC_PRODUCTS_VIEW_TYPE=slides
ARG EXPO_PUBLIC_ORDER_INFO_TYPE=page
ARG EXPO_PUBLIC_DEFAULT_LANGUAGE=en-US
ARG EXPO_PUBLIC_DEFAULT_LATITUDE=42.6459136
ARG EXPO_PUBLIC_DEFAULT_LONGITUDE=23.3332736
ARG EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ARG EXPO_PUBLIC_SUPPORT_NUMBER=0888888888
ARG EXPO_PUBLIC_COMPANY_NAME="Ever Co. LTD"
ARG EXPO_PUBLIC_SETTINGS_APP_TYPE=shop-mobile
ARG EXPO_PUBLIC_SETTINGS_MAINTENANCE_API_URL=
ARG EXPO_PUBLIC_MERCHANT_IDS=
ARG EXPO_PUBLIC_SHOPPING_CART=false
ARG EXPO_PUBLIC_FAKE_INVITE_CODE=off

ENV EXPO_PUBLIC_PRODUCTION=$EXPO_PUBLIC_PRODUCTION \
	EXPO_PUBLIC_SERVICES_ENDPOINT=$EXPO_PUBLIC_SERVICES_ENDPOINT \
	EXPO_PUBLIC_GQL_ENDPOINT=$EXPO_PUBLIC_GQL_ENDPOINT \
	EXPO_PUBLIC_GQL_SUBSCRIPTIONS_ENDPOINT=$EXPO_PUBLIC_GQL_SUBSCRIPTIONS_ENDPOINT \
	EXPO_PUBLIC_PRODUCTS_VIEW_TYPE=$EXPO_PUBLIC_PRODUCTS_VIEW_TYPE \
	EXPO_PUBLIC_ORDER_INFO_TYPE=$EXPO_PUBLIC_ORDER_INFO_TYPE \
	EXPO_PUBLIC_DEFAULT_LANGUAGE=$EXPO_PUBLIC_DEFAULT_LANGUAGE \
	EXPO_PUBLIC_DEFAULT_LATITUDE=$EXPO_PUBLIC_DEFAULT_LATITUDE \
	EXPO_PUBLIC_DEFAULT_LONGITUDE=$EXPO_PUBLIC_DEFAULT_LONGITUDE \
	EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=$EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY \
	EXPO_PUBLIC_SUPPORT_NUMBER=$EXPO_PUBLIC_SUPPORT_NUMBER \
	EXPO_PUBLIC_COMPANY_NAME=$EXPO_PUBLIC_COMPANY_NAME \
	EXPO_PUBLIC_SETTINGS_APP_TYPE=$EXPO_PUBLIC_SETTINGS_APP_TYPE \
	EXPO_PUBLIC_SETTINGS_MAINTENANCE_API_URL=$EXPO_PUBLIC_SETTINGS_MAINTENANCE_API_URL \
	EXPO_PUBLIC_MERCHANT_IDS=$EXPO_PUBLIC_MERCHANT_IDS \
	EXPO_PUBLIC_SHOPPING_CART=$EXPO_PUBLIC_SHOPPING_CART \
	EXPO_PUBLIC_FAKE_INVITE_CODE=$EXPO_PUBLIC_FAKE_INVITE_CODE \
	NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm --filter @ever-platform/shop-mobile-expo build

FROM nginx:alpine AS production

COPY .deploy/shop-mobile-expo/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /srv/ever/packages/shop-mobile-expo/dist /usr/share/nginx/html

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
