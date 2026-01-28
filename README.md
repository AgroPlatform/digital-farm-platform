# Digital Farm Platform

A modern monorepo architecture featuring a FastAPI backend, Vite frontend, and PostgreSQL database for agricultural management systems.

## 🏗️ Architecture Overview

This project is structured as a monorepo containing three main components:

- **Backend**: FastAPI (Python 3.11) REST API with SQLAlchemy 2.0
- **Frontend**: Vite (React + TypeScript) with Tailwind CSS
- **Database**: PostgreSQL 15

## 📁 Project Structure

```
digital-farm-platform/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── routes/
│   │   │       └── health.py  # Health check endpoint
│   │   ├── core/              # Core configuration
│   │   │   └── config.py      # Settings and environment variables
│   │   ├── db/                # Database setup
│   │   │   └── session.py     # SQLAlchemy session management
│   │   └── main.py            # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container configuration
│   └── .env.example          # Environment variables template
│
├── frontend/                  # Vite Frontend
│   ├── src/
│   │   ├── App.tsx           # Main application shell
│   │   ├── main.tsx          # Vite entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tsconfig.json         # TypeScript configuration
│   ├── Dockerfile           # Frontend container configuration
│   └── .env.example         # Environment variables template
│
├── docker-compose.yml        # Multi-container orchestration
├── .env.example             # Root environment variables template
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- OR:
  - Python 3.11+
  - Node.js 18+
  - PostgreSQL 15+

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/AgroPlatform/digital-farm-platform.git
   cd digital-farm-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Database: localhost:5432

### Manual Setup (Without Docker)

If you prefer, the repo includes a `Makefile` with shortcuts: `make backend` (FastAPI) and `make frontend` (Vite).

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   When `DEBUG=True`, the backend creates tables on startup using
   `Base.metadata.create_all()` for local development.

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Development with Docker (live edit)

You can also use the provided `Makefile` shortcut:

```bash
make dev
```

Use the development compose file to run the backend and frontend with host bind-mounts so you can edit code on your machine and see changes immediately inside the containers.

- Backend: runs uvicorn with --reload (port 8000)
- Frontend: runs the Vite dev server (port 5173)

Run the following from the repository root to start the dev stack:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Notes and tips:
- The `backend` and `frontend` services mount your local source directories into the containers. Edit files locally; changes are reflected immediately inside the running containers.
- Frontend dev server runs on port 5173 by default. Open http://localhost:5173 for the live Vite app.
- If you prefer the production nginx + build flow, use the standard `docker-compose.yml` which serves the compiled frontend on port 3000.
- Named volumes (`frontend_node_modules` and `backend_venv`) are used to keep container-installed dependencies separate from the host filesystem.

Development notes (ports and mapping)
- Backend dev server: http://localhost:8000 (uvicorn --reload)
- Frontend dev server (Vite): http://localhost:5173

- If you'd rather test the dev frontend on the same external port as production (3000) you can map the port in `docker-compose.dev.yml`:

```yaml
services:
   web:
      ports:
         - "3000:5173" # map host:container so http://localhost:3000 opens the Vite dev server
```

Dockerfile naming and dev vs production
- Dev Dockerfiles: `backend/Dockerfile.dev` and `frontend/Dockerfile.dev` — these install dependencies but rely on host bind-mounts for live editing and run the dev servers (uvicorn --reload and Vite).
- Prod Dockerfiles: `backend/Dockerfile.prod` and `frontend/Dockerfile.prod` — these are used by `docker-compose.yml` for production builds and do not enable autoreload or the Vite dev server.

Polish & troubleshooting
- If you see a Compose warning about `version:` being obsolete, it's harmless but you can remove that top-level key from `docker-compose.dev.yml`.
- If the Vite dev server doesn't pick up changes on macOS, we set `CHOKIDAR_USEPOLLING=true` in the dev compose; you can also adjust polling settings if needed.
- Consider adding `.dockerignore` entries for `node_modules`, `.venv`, and `dist` to speed builds and avoid copying host dependency folders into images.

## Production with Docker

Use the production compose and prod-named Dockerfiles to run the app in production mode (no reload, static frontend served by nginx).

From the repository root:

```bash
docker-compose -f docker-compose.yml up --build -d
```

- Production frontend is served on host port 3000 by default (maps to container nginx port 80).
- Production backend listens on host port 8000 (uvicorn without --reload).
- The production compose is configured to build using `Dockerfile.prod` files so CI/CD pipelines can build/push those images.

Security and schema notes
- Before starting production, make sure `DEBUG` is set to `False` and production secrets are provided via environment variables or a secret manager.
- In production, manage schema changes explicitly (for example, by running a dedicated migration process) rather than relying on dev-time auto-creation.

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/digital_farm` |
| `API_HOST` | API host address | `0.0.0.0` |
| `API_PORT` | API port | `8000` |
| `DEBUG` | Debug mode | `True` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://web:3000` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## 📚 API Endpoints

### Health Check
- **GET** `/health` - Check API and database health status
- **GET** `/` - Root endpoint with API information
- **GET** `/docs` - Interactive API documentation (Swagger UI)

## 🛠️ Development

### Backend

- **Run tests**: (Add your test command here)
- **Schema creation (dev)**: when `DEBUG=True`, tables are created automatically at startup with SQLAlchemy `create_all()`.

### Frontend

- **Run development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db

# Remove all containers and volumes
docker-compose down -v
```

## 🔒 Security

- Backend implements CORS protection
- Environment variables for sensitive configuration
- PostgreSQL password authentication
- Health check endpoints for monitoring

## 📝 License

This project is part of the AgroPlatform digital farming initiative.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support and questions, please open an issue in the GitHub repository.
