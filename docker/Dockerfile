# ===================== 构建阶段 =====================
# 使用 Node 20（alpine 精简镜像），执行 TypeScript 编译
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===================== 运行阶段 =====================
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 只安装生产依赖（typespeed + express 等，不含 typescript 等 devDeps）
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# 复制构建产物
COPY --from=build /app/dist ./dist

# 非 root 运行（安全最佳实践）
USER node

EXPOSE 8080

# 健康检查：typespeed 内建 /health（liveness）
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

# 启动编译后的应用入口（typespeed @app 会自动启动 main()）
CMD ["node", "dist/main.js"]
