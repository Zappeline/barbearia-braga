FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia o schema do Prisma e gera o client
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
