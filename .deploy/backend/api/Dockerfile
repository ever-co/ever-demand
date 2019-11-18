# API

FROM node:alpine AS development

RUN apk update \
    && apk add libexecinfo libexecinfo-dev \
    && npm i -g npm \
    && apk --no-cache add --virtual builds-deps build-base \
    snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git \
    && npm install --quiet node-gyp -g \ 
    && npm config set python /usr/bin/python \
    && npm install yarn -g	

RUN mkdir /srv/ever && chown node:node /srv/ever

USER node

WORKDIR /srv/ever

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node backend/api/package.json ./backend/api/package.json
COPY --chown=node:node .snyk ./.snyk
COPY --chown=node:node backend/api/.snyk ./backend/api/.snyk

RUN yarn install

RUN yarn --cwd ./backend/api install

FROM node:alpine AS production

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.6.0/wait /wait

RUN npm install cross-env -g \
    && npm install pm2 -g --unsafe-perm \
    && chmod +x /wait

RUN mkdir /srv/ever && chown node:node /srv/ever
RUN mkdir -p /srv/ever/backend/api/build && chown node:node /srv/ever/backend/api/build

USER node

WORKDIR /srv/ever

ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

COPY --from=development --chown=root:root /srv/ever/node_modules ./node_modules
COPY --from=development --chown=root:root /srv/ever/backend/api/node_modules ./backend/api/node_modules

COPY . .

EXPOSE 5500 5501 5050 5555

CMD /wait \
    && cross-env NODE_ENV=production NODE_OPTIONS=--max_old_space_size=2048 yarn --cwd ./backend/api node build/main.js