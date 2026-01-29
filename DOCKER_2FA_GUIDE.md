# 🐳 Running 2FA on Docker

## Quick Start

### Start Docker Container
```bash
make dev
```

This will start:
- **Frontend:** http://localhost:5173 (development)
- **Backend:** http://localhost:8000 (development)
- **Database:** PostgreSQL on localhost:5432
- **Admin Panel:** (if configured)

### Alternative: Direct Docker Commands
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Configuration for Docker

### Frontend to Backend Communication

**In Development (docker-compose.dev.yml):**
```yaml
environment:
  VITE_API_URL: http://api:8000
```

The frontend container uses the service name `api` (not localhost) because Docker networking uses service names for inter-container communication.

**In Production (docker-compose.prod.yml):**
```yaml
environment:
  VITE_API_URL: http://api:8000
```

Same approach - service names for internal Docker networking.

**Local Development (without Docker):**
```bash
cd frontend
# Uses environment variable fallback
npm run dev
# Defaults to: http://localhost:8000
```

### Key Files

**frontend/vite.config.ts:**
- Proxy configuration for development
- Allows `VITE_API_URL` environment variable override

**frontend/src/api/client.ts:**
- Uses `import.meta.env.VITE_API_URL` with fallback to `http://localhost:8000`
- Automatically constructs full API URLs
- Handles credentials and cookies properly

**frontend/src/api/totp.ts (NEW):**
- Centralized 2FA API functions
- Uses client.post() and client.get()
- Automatically routes through correct API URL

## Docker Networking

In Docker Compose, containers communicate via service names on a bridge network:

```
┌─────────────────────────────┐
│   Digital Farm Network      │
├─────────────────────────────┤
│                              │
│  web (frontend:5173) ─────┐  │
│                             │
│  api (backend:8000) ◄─────┘  │
│                             │
│  db (postgres:5432)         │
│                             │
└─────────────────────────────┘
```

- **web** container accesses **api** via `http://api:8000`
- **api** container accesses **db** via `postgresql://postgres:postgres@db:5432`
- **From host machine:** Access via `http://localhost:5173` and `http://localhost:8000`

## Testing 2FA in Docker

### 1. Access Frontend
```bash
http://localhost:5173
```

### 2. Register or Login
```
Email: test@example.com
Password: TestPass123!
```

### 3. Go to Settings → Security
Click "2FA Inschakelen"

### 4. Enter Password
Confirms your identity

### 5. Scan QR Code
Use Google Authenticator or similar app

### 6. Verify Code
Enter 6-digit code from authenticator

### 7. Test Login
1. Logout
2. Login with email + password
3. Enter TOTP code
4. Should succeed!

## Troubleshooting Docker

### 404 on API Calls
**Problem:** Frontend gets 404 when calling `/api/totp/setup`

**Cause:** Frontend is trying to access relative path without API URL

**Solution:** 
- Check `VITE_API_URL` environment variable in docker-compose.yml
- Should be `http://api:8000` (service name, not localhost)
- Not `http://localhost:8000` (localhost resolves to frontend container)

### Connection Refused
**Problem:** `Connection refused` errors

**Cause:** Services not running or not ready

**Solution:**
```bash
# Check service status
docker ps

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Restart
docker-compose down
docker-compose up -d
docker-compose logs -f
```

### Port Already in Use
**Problem:** Port 5173, 8000, or 5432 already in use

**Solution:**
```bash
# Stop other services
docker-compose down

# Or use different ports in docker-compose.yml
ports:
  - "15173:5173"  # Use 15173 instead
```

### Database Connection Error
**Problem:** Backend can't connect to database

**Check:**
```bash
# Connect to DB container
docker exec -it digital-farm-db psql -U postgres -d digital_farm

# Should show database tables
\dt
```

## Environment Variables

### Frontend (.env file or docker-compose)
```
VITE_API_URL=http://api:8000    # Docker
VITE_API_URL=http://localhost:8000  # Local dev
```

### Backend (.env file)
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/digital_farm
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS='["http://localhost:5173","http://localhost:3000","http://web:5173"]'
```

## Performance Tips

### Faster Builds
```bash
# Cache Docker layers
docker-compose build --no-cache
```

### Monitor Resource Usage
```bash
docker stats
```

### Clean Up Unused Data
```bash
docker system prune -a
```

## Production Deployment

### Build for Production
```bash
# Frontend
docker build -f frontend/Dockerfile.prod -t digital-farm-web:1.0 ./frontend

# Backend
docker build -f backend/Dockerfile.prod -t digital-farm-api:1.0 ./backend
```

### Deploy with Production Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Debugging

### View Frontend Logs
```bash
docker-compose logs -f web
```

### View Backend Logs
```bash
docker-compose logs -f api
```

### Execute Commands in Container
```bash
# Terminal into web container
docker exec -it digital-farm-web-dev bash

# Terminal into api container  
docker exec -it digital-farm-api-dev bash

# Run python in api
docker exec -it digital-farm-api-dev python -c "import pyotp; print('OK')"
```

### Check Container Status
```bash
docker ps -a
docker-compose ps
```

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Build images
docker-compose build

# Remove containers and volumes
docker-compose down -v

# Execute command in container
docker-compose exec web npm run dev
docker-compose exec api python -m pytest
```

## Success Indicators

✅ All containers running:
```bash
$ docker-compose ps
NAME                      STATUS
digital-farm-db           Up (healthy)
digital-farm-api-dev      Up
digital-farm-web-dev      Up
```

✅ Frontend accessible:
```
http://localhost:5173 → Loads without errors
```

✅ Backend accessible:
```
http://localhost:8000/docs → Swagger UI loads
```

✅ API calls working:
```bash
curl -X GET http://localhost:8000/api/totp/status \
  -H "Content-Type: application/json" \
  --cookie "access_token=..." 
```

✅ 2FA working:
1. Can enable 2FA in Settings
2. Can scan QR code
3. Can login with TOTP code

## Next Steps

- [ ] Configure environment for production
- [ ] Set up SSL/TLS certificates
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Configure secrets management
- [ ] Set up CI/CD pipeline

---

**2FA is now ready to use in your Docker environment! 🎉**
