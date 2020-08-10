FROM node:12.18.2-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn install --production \
  && yarn cache clean

ADD client /app/client
ADD lib /app/lib
ADD style /app/style
ADD views /app/views
ADD favicon.ico /app/favicon.ico
ADD server.js /app/server.js

CMD node lib/server