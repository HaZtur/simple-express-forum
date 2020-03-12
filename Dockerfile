FROM node:12.16.1-buster-slim
WORKDIR /usr/scr/app
COPY . .
RUN apt update && apt install -y python3.7 && npm install
CMD npm start