from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, fields

app = FastAPI(
    title="Digital Farm Platform API",
    description="Backend API for Digital Farm Platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(fields.router, tags=["Fields"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Digital Farm Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }
