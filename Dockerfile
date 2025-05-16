FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

RUN npm install

COPY src ./src

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "dev"] 