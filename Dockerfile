# syntax=docker/dockerfile:1

# =============================================================================
# base — tudo que os estágios finais compartilham.
# Tag fixa (não `22-alpine`): build reproduzível é pré-requisito do CI/CD.
# =============================================================================
FROM node:22.23.1-alpine3.23 AS base
WORKDIR /usr/src/app
# dumb-init: como PID 1 o kernel não aplica as disposições padrão de sinal, e o
# node passa a IGNORAR SIGTERM. Sem isto, todo `kubectl delete pod` espera o
# terminationGracePeriodSeconds inteiro e termina em SIGKILL.
RUN apk add --no-cache dumb-init

# =============================================================================
# deps — instala node_modules uma única vez. Copiado antes do código-fonte
# para que a camada de `npm ci` sobreviva a edições em src/.
# =============================================================================
FROM base AS deps
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# =============================================================================
# development — usado pelo docker-compose.yml (hot reload via bind mount).
# =============================================================================
FROM deps AS development
ENV NODE_ENV=development
COPY . .
RUN npx prisma generate
RUN apk add --no-cache bash curl && chmod +x /usr/src/app/scripts/sonar.sh
EXPOSE 3000 9229
CMD ["npm", "run", "start:dev"]

# =============================================================================
# builder — compila e enxuga. Um único `npm ci` (em deps) e depois um prune,
# em vez de dois installs completos.
# =============================================================================
FROM deps AS builder
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build
# `prisma` é dependency (não devDependency), então sobrevive ao prune e fica
# disponível para o initContainer de migration no Kubernetes.
RUN npm prune --omit=dev
# Regenerar após o prune é idempotente (~3s) e elimina qualquer dúvida sobre o
# prune ter tocado em node_modules/.prisma.
RUN npx prisma generate

# =============================================================================
# production — imagem final. Non-root, sem toolchain, sem código-fonte.
# =============================================================================
FROM base AS production
ENV NODE_ENV=production
# O node dimensiona o heap pela RAM do host, não pelo limite do cgroup. Sem
# isto, um limite de 512Mi no K8s vira OOMKill em vez de GC.
ENV NODE_OPTIONS=--max-old-space-size=384

COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/prisma ./prisma
COPY --from=builder --chown=node:node /usr/src/app/package.json ./package.json
# schema.prisma não tem `url`, então o CLI precisa de um arquivo de config.
# Tem de ser o .ts: testado, o loader do Prisma 7 rejeita o .js CommonJS
# emitido pelo nest build ("Failed to parse syntax of config file").
# `ts-node` NÃO é necessário — o @prisma/config transpila via jiti, e o
# comando funciona mesmo depois do `npm prune --omit=dev`.
COPY --from=builder --chown=node:node /usr/src/app/prisma.config.ts ./prisma.config.ts

USER node
EXPOSE 3000

# A imagem de produção não tem curl/wget de propósito. Node 22 tem fetch global.
# (O Kubernetes ignora HEALTHCHECK — isto serve ao compose e ao `docker ps`.)
HEALTHCHECK --interval=30s --timeout=3s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
