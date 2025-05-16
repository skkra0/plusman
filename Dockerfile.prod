FROM node:22-alpine
WORKDIR /app

COPY . ./

RUN corepack enable && pnpm install --frozen-lockfile

RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=0 /app/public ./public
COPY --from=0 /app/.next ./.next
COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]