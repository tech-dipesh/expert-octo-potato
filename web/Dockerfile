FROM node:lts-slim
RUN npm i -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API=http://localhost:8000
ENV VITE_API=$VITE_API
RUN pnpm build
EXPOSE 5173
CMD ["pnpm", "start", "--host", "0.0.0.0", "--port", "5173"]
