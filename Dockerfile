FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:render

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=10000
COPY --from=build --chown=node:node /app/.render-next/standalone ./
COPY --from=build --chown=node:node /app/.render-next/static ./.render-next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts/neon-migrate.mjs ./scripts/neon-migrate.mjs
COPY --from=build --chown=node:node /app/node_modules/@neondatabase/serverless ./node_modules/@neondatabase/serverless
USER node
EXPOSE 10000
CMD ["sh","-c","node scripts/neon-migrate.mjs && node server.js"]
