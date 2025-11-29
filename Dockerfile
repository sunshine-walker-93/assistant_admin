# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建参数：API 基础 URL
ARG VITE_API_BASE_URL=http://assistant-gateway-app:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建参数：网关管理服务 API 基础 URL
# 注意：浏览器在宿主机上运行，应使用 localhost 访问映射的端口
ARG VITE_ADMIN_API_BASE_URL=http://localhost:8081
ENV VITE_ADMIN_API_BASE_URL=$VITE_ADMIN_API_BASE_URL

# 构建项目
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 全局安装 serve 包
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动静态文件服务器
# -s: 单页应用模式，所有路由都返回 index.html
# -l: 监听端口
CMD ["serve", "-s", "dist", "-l", "3000"]

