# 镜像名和默认 tag
IMAGE_NAME := 93maoshui/assistant-admin
IMAGE_TAG  ?= latest
COMPOSE_PROJECT_NAME ?= assistant

# 安装依赖
npm-install:
	npm install

# 启动开发服务器
dev:
	npm run dev

# 本地构建项目
build:
	npm run build

# 本地构建镜像（用于 docker-compose / K8s 部署）
docker-build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

# 构建并推送到 Docker Hub
push: docker-build
	docker push $(IMAGE_NAME):$(IMAGE_TAG)

# 按时间生成一个 dev tag 并推送（可选）
push-dev:
	IMAGE_TAG=dev-$(shell date +%Y%m%d-%H%M%S) $(MAKE) push

# 本地启动（使用 docker-compose）
run:
	docker compose -p $(COMPOSE_PROJECT_NAME) up -d --build frontend-admin

# 查看日志
logs:
	docker compose -p $(COMPOSE_PROJECT_NAME) logs -f frontend-admin

# 停止容器
stop:
	docker compose -p $(COMPOSE_PROJECT_NAME) stop frontend-admin

# 删除容器（保留卷）
down:
	docker compose -p $(COMPOSE_PROJECT_NAME) down

.PHONY: npm-install dev build docker-build push push-dev run logs stop down

