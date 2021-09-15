FROM node:14.17.6-alpine as builder

RUN mkdir -p /app/server
WORKDIR /app/server

COPY package*.json /app/server/

RUN npm install --production=true

COPY . /app/server/

FROM node:10.9.0-alpine

RUN mkdir -p /app/server
WORKDIR /app/server

COPY --from=builder /app/server /app/server

CMD ["node", "server.js"]