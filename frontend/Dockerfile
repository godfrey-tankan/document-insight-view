# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Serve using a static file server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
