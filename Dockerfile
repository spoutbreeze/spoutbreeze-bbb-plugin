FROM node:18-alpine AS builder

WORKDIR /

COPY package*.json ./
RUN npm ci

# Update browserslist database
RUN npx update-browserslist-db@latest

COPY . .

RUN npm run build-bundle

FROM nginx:alpine

COPY --from=builder /dist /usr/share/nginx/html
COPY --from=builder /manifest.json /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]