FROM node:alpine

RUN apk update

RUN npm i -g npm

RUN apk add libexecinfo libexecinfo-dev

RUN apk --no-cache add --virtual builds-deps build-base \
  snappy g++ snappy-dev gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

RUN npm config set python /usr/bin/python

RUN npm install yarn -g

RUN npm install pm2 -g --unsafe-perm

# Import MongoDB public GPG key AND create a MongoDB list file
## RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
# RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
## RUN apt-get update
# RUN apt-get install -y mongodb-org; exit 0
# RUN mkdir -p /data/db
# RUN mongod --logpath mongod.log --fork

# Make our app folder (empty for now)
RUN mkdir -p /usr/src/app

# Provides cached layer for node_modules and bower_components
ADD package.json /tmp/package.json
COPY .snyk /tmp/.snyk
COPY yarn.lock /tmp/yarn.lock
RUN cd /tmp/ && yarn install
RUN cp -a /tmp/node_modules /usr/src/app/
RUN cd /usr/src/app

WORKDIR /usr/src/app

# Bundle app source
ADD . /usr/src/app

RUN $(npm bin)/tsc

EXPOSE 5500 5501 5050 5555

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

CMD /wait && yarn run prod
