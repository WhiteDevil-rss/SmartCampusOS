FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
# We'll rely on local node_modules for dev
CMD ["npm", "run", "dev"]
