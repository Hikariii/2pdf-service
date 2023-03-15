FROM node:18-slim

RUN apt-get update && apt-get install -y inotify-tools

WORKDIR /usr/src/app

# Install app dependencies
COPY ./app /usr/src/app
RUN npm ci
RUN npm run build

CMD ["npm", "run", "start"]
