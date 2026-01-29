from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine

from app.api.routes import health, fields
from app.api.routes import health
from app.api.routes import auth as auth_router
from app.api.routes import user as user_router
from app.api.routes import weather as weather_router
from app.api.routes import fields as fields_router
from app.api.routes import crops as crops_router
from app.api.routes import totp as totp_router
import app.models  # noqa: F401

app = FastAPI(
    title="Digital Farm Platform API",
    description="Backend API for Digital Farm Platform",
    version="1.0.0",
)

# Configure CORS

# Use configured CORS origins (do NOT use wildcard when allow_credentials=True)
origins = settings.CORS_ORIGINS or []
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(fields.router, tags=["Fields"])
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(fields_router.router)
app.include_router(weather_router.router)
app.include_router(crops_router.router, prefix="/crops", tags=["Crops"])
app.include_router(totp_router.router)



@app.on_event("startup")
def ensure_schema_for_dev() -> None:
    if settings.DEBUG:
        Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Digital Farm Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }
