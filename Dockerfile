FROM node:18-alpine AS builder

WORKDIR /

COPY package*.json ./
RUN npm ci

# Update browserslist database
RUN npx update-browserslist-db@latest

COPY . .

RUN npm run build-bundle

FROM nginx:alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Delete the default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Create SSL directory and generate self-signed certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=*"

COPY --from=builder /dist /usr/share/nginx/html
COPY --from=builder /manifest.json /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]