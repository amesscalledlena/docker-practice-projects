# This Dockerfile is provided: the exercise is the compose file.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
