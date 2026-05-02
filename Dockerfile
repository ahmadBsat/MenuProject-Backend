ARG NODE_VERSION=22.13.0

FROM node:${NODE_VERSION}-alpine

LABEL org.opencontainers.image.source=https://github.com/ahmadBsat/MenuProject-Backend

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

USER node

CMD ["npm", "run", "start"]
