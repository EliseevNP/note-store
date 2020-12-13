FROM node:12-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i
CMD ["npm", "run", "dev"]
