FROM node:25 as builder

COPY . /app
COPY fly/.env.production /app
WORKDIR /app
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile && pnpm run build

FROM caddy:2
COPY --from=builder /app/dist/ /usr/share/caddy/
COPY fly/Caddyfile /etc/caddy/Caddyfile
