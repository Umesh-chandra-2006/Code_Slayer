FROM node:18-alpine

RUN apk add --no-cache build-base g++ python3

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
