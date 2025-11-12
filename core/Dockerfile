FROM node:lts-alpine

WORKDIR /app
EXPOSE  4001
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
COPY . .

RUN npm run build

CMD [ "npm", "start"]