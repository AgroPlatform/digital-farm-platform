.PHONY: dev backend frontend

dev:
	docker-compose -f docker-compose.dev.yml up --build

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev
