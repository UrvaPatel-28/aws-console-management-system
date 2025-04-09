# Stage 1: Build
FROM node:lts-alpine AS base

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
from node:lts-alpine AS runner
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/tsconfig.build.json ./
COPY package.json ./

EXPOSE 3001

CMD ["npm", "start"]
