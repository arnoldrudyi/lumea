FROM node:alpine as builder

ENV PROJECT_DIR="/lumea-frontend"

WORKDIR ${PROJECT_DIR}

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:alpine

ENV PROJECT_DIR="/lumea-frontend"

COPY --from=builder ${PROJECT_DIR} ./

EXPOSE 3000

CMD ["npm", "start"]
