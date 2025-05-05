FROM node:23 as builder

COPY . /app
COPY fly/.env.production /app
WORKDIR /app
RUN yarn install --immutable && yarn run build

FROM caddy:2
COPY --from=builder /app/dist/ /usr/share/caddy/
COPY fly/Caddyfile /etc/caddy/Caddyfile
