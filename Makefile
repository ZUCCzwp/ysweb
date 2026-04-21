.PHONY: build run stop logs

DOCKER_COMPOSE = docker-compose

build:
	$(DOCKER_COMPOSE) build

run:
	$(DOCKER_COMPOSE) up -d

stop:
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f
