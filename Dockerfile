FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

EXPOSE 7000

ENV PORT=7000

CMD ["node", "server.js"]
