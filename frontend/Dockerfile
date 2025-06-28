FROM node:18-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]