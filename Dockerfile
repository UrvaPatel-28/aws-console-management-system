# Stage 1: Build
FROM node:lts-alpine AS base

RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install
COPY . .
RUN pnpm build

# Stage 2: Run
from node:lts-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/tsconfig.build.json ./
COPY package.json ./

EXPOSE 3001

CMD ["pnpm", "start"]
