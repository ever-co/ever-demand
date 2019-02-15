# Usage:
#
#    Build image:
#    docker build -t ever-shop .
#
#    Run image (on localhost:8080):
#    docker run --name ever-shop -p 8080:80 ever-shop
#
#    Run image as virtual host (read more: https://github.com/jwilder/nginx-proxy):
#    docker run -e VIRTUAL_HOST=ever-shop.your-domain.com --name ever-shop ever-shop

FROM node:8.9.4-alpine as builder

COPY package.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i && mkdir /ng-app && mv ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .
