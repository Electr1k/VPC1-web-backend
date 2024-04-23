FROM node:20.6.0-alpine
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--env-file=.env", "index.js" ]