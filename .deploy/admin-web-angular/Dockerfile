FROM node:alpine AS development

RUN apk update \
	&& apk add libexecinfo libexecinfo-dev \
	&& npm i -g npm \
	&& apk --no-cache add --virtual builds-deps build-base \
	snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git \
	&& npm install --quiet node-gyp -g \
	&& npm config set python /usr/bin/python \
	&& npm install yarn -g --force

RUN mkdir /srv/ever && chown node:node /srv/ever

USER node

WORKDIR /srv/ever

COPY --chown=node:node package.json yarn.lock lerna.json package.workspaces.json ./
COPY --chown=node:node packages/admin-web-angular/package.json ./packages/admin-web-angular/package.json
COPY --chown=node:node .snyk ./.snyk
COPY --chown=node:node packages/common ./packages/common
COPY --chown=node:node packages/common-angular ./packages/common-angular

RUN yarn install

FROM node:alpine AS production

RUN npm install cross-env -g

RUN mkdir /srv/ever && chown node:node /srv/ever
RUN mkdir -p /srv/ever/packages/admin-web-angular && chown node:node /srv/ever/packages/admin-web-angular
RUN mkdir -p /srv/ever/packages/common && chown node:node /srv/ever/packages/common
RUN mkdir -p /srv/ever/packages/common-angular && chown node:node /srv/ever/packages/common-angular

USER node

WORKDIR /srv/ever

ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

COPY --from=development --chown=node:node /srv/ever/node_modules ./node_modules
COPY --from=development --chown=node:node /srv/ever/packages/common/node_modules ./packages/common/node_modules
COPY --from=development --chown=node:node /srv/ever/packages/common-angular/node_modules ./packages/common-angular/node_modules
COPY --from=development --chown=node:node /srv/ever/packages/admin-web-angular/node_modules ./packages/admin-web-angular/node_modules
COPY --chown=node:node package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY --chown=node:node packages/common ./packages/common
COPY --chown=node:node packages/common-angular ./packages/common-angular
COPY --chown=node:node packages/admin-web-angular ./packages/admin-web-angular