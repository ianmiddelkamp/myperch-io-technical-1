FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g ts-node && npm ci --ignore-scripts

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
