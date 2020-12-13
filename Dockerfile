FROM node:12-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only prod
COPY ./src ./src
CMD ["npm", "start"]
