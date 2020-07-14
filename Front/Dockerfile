FROM node:12.16

RUN apt-get update && apt-get install -y git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY build/ /usr/src/app/build
COPY server.js /usr/src/app
COPY package.json /usr/src/app
ENV NODE_PATH .
ENV NODE_ENV production

RUN npm i --quiet --production
CMD node server
