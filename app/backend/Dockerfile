FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"]
