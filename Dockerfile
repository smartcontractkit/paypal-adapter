FROM node:alpine

WORKDIR /paypal-adapter
ADD . .

RUN apk add --no-cache git
RUN yarn install
RUN yarn build

EXPOSE 5000
ENTRYPOINT ["node", "./dist/server.js", "5000"]
