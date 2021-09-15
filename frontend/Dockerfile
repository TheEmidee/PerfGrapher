FROM node:14.17.6-alpine as builder

RUN mkdir -p /app/reports

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package* /usr/src/app/

RUN npm install

COPY . /usr/src/app/

RUN npm run build

FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /usr/src/app/build /usr/share/nginx/html

RUN chown nginx.nginx /usr/share/nginx/html/ -R

WORKDIR /usr/share/nginx/html/
RUN ln -s /app/reports ./reports

EXPOSE 80