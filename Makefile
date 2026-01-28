.PHONY: dev backend frontend stop down clean prune-images

dev:
	docker-compose -f docker-compose.dev.yml up --build -d

build:
	docker-compose -f docker-compose.dev.yml up -d

backend:
	docker compose -f docker-compose.dev.yml up --build -d api

frontend:
	docker compose -f docker-compose.dev.yml up --build -d frontend

stop:
	docker compose -f docker-compose.dev.yml stop

down:
	docker compose -f docker-compose.dev.yml down --volumes --rmi local

clean: down
	# Bring the compose stack down and forcibly remove the named dev volumes
	@echo "Forcing removal of dev volumes (if present): postgres_data, frontend_node_modules, backend_venv"
	-@for name in postgres_data frontend_node_modules backend_venv; do \
		matches=$$(docker volume ls -q | grep -E "$$name" || true); \
		if [ -n "$$matches" ]; then docker volume rm -f $$matches || true; fi; \
	done
	@echo "Done removing dev volumes"

prune-images:
	# Remove all unused images (be careful: this deletes images not referenced by any container)
	docker image prune -a -f 