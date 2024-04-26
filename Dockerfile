FROM node:20.6.0-alpine
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]