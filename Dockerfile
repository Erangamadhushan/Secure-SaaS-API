FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

WORKDIR /appgroup

COPY package*.json ./

RUN npm install --production

COPY . ./

EXPOSE 5000

CMD ["node", "src/server.js"]