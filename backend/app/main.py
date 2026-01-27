from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health
from app.api.routes import auth as auth_router
from app.api.routes import user as user_router

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
app.include_router(auth_router.router)
app.include_router(user_router.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Digital Farm Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }
