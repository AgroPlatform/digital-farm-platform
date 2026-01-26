# Digital Farm Platform

A modern monorepo architecture featuring a FastAPI backend, Next.js frontend, and PostgreSQL database for agricultural management systems.

## 🏗️ Architecture Overview

This project is structured as a monorepo containing three main components:

- **Backend**: FastAPI (Python 3.11) REST API with SQLAlchemy 2.0 and Alembic
- **Frontend**: Next.js (React + TypeScript) with Tailwind CSS
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
│   ├── alembic/               # Database migrations
│   │   ├── versions/          # Migration scripts
│   │   └── env.py            # Alembic environment configuration
│   ├── alembic.ini           # Alembic configuration
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container configuration
│   └── .env.example          # Environment variables template
│
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx      # Home page with health check
│   │       ├── layout.tsx    # Root layout
│   │       └── globals.css   # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   ├── next.config.ts        # Next.js configuration
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

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

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
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## 📚 API Endpoints

### Health Check
- **GET** `/health` - Check API and database health status
- **GET** `/` - Root endpoint with API information
- **GET** `/docs` - Interactive API documentation (Swagger UI)

## 🛠️ Development

### Backend

- **Run tests**: (Add your test command here)
- **Create migration**: 
  ```bash
  cd backend
  alembic revision --autogenerate -m "description"
  ```
- **Apply migrations**: 
  ```bash
  alembic upgrade head
  ```

### Frontend

- **Run development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
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
