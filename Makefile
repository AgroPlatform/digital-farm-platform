.PHONY: dev backend frontend

dev:
	docker-compose -f docker-compose.dev.yml up --build -d

backend:
	docker compose -f docker-compose.dev.yml up --build -d api

frontend:
	docker compose -f docker-compose.dev.yml up --build -d frontend