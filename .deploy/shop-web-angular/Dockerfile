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
COPY --chown=node:node packages/shop-web-angular/package.json ./packages/shop-web-angular/package.json
COPY --chown=node:node .snyk ./.snyk
COPY --chown=node:node packages/common ./packages/common
COPY --chown=node:node packages/common-angular ./packages/common-angular

RUN yarn install

FROM node:alpine AS production

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait

RUN npm install cross-env -g \
	&& npm install pm2 -g --unsafe-perm \
	&& chmod +x /wait

RUN mkdir /srv/ever && chown node:node /srv/ever
RUN mkdir -p /srv/ever/packages/shop-web-angular && chown node:node /srv/ever/packages/shop-web-angular
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
COPY --from=development --chown=node:node /srv/ever/packages/shop-web-angular/node_modules ./packages/shop-web-angular/node_modules
COPY --chown=node:node package.json yarn.lock lerna.json package.workspaces.json tsconfig.base.json ./
COPY --chown=node:node packages/common ./packages/common
COPY --chown=node:node packages/common-angular ./packages/common-angular
COPY --chown=node:node packages/shop-web-angular ./packages/shop-web-angular

EXPOSE 5500 5501 5050 5555

CMD /wait \
	&& yarn run:shopweb