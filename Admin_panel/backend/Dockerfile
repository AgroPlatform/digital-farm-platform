FROM python:3.11-slim

# Build in the Admin_panel context so we can copy both backend and frontend
WORKDIR /app/backend

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Install python deps from backend requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend and frontend into the image
COPY backend /app/backend
COPY frontend /app/frontend

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
