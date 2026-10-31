FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --chown=node:node app.js index.js ./
COPY --chown=node:node config ./config
COPY --chown=node:node controllers ./controllers
COPY --chown=node:node middleware ./middleware
COPY --chown=node:node models ./models
COPY --chown=node:node routes ./routes
COPY --chown=node:node services ./services
COPY --chown=node:node utils ./utils
COPY --chown=node:node seed ./seed
COPY --chown=node:node scripts/seed.js ./scripts/seed.js

USER node
EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "index.js"]
