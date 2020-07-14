FROM node:12.16

RUN apt-get update && apt-get install \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

ENV NODE_ENV production
RUN npm i --quiet --production

CMD npm start
