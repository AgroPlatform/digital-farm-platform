from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
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
    if settings.AUTO_MIGRATE:
        add_missing_field_columns()
        add_missing_user_columns()


def add_missing_field_columns() -> None:
    inspector = inspect(engine)
    if "fields" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("fields")}
    columns_to_add = []
    if "planting_date" not in existing_columns:
        columns_to_add.append("ALTER TABLE fields ADD COLUMN IF NOT EXISTS planting_date DATE")
    if "growth_days" not in existing_columns:
        columns_to_add.append("ALTER TABLE fields ADD COLUMN IF NOT EXISTS growth_days INTEGER")

    if not columns_to_add:
        return

    with engine.begin() as connection:
        for statement in columns_to_add:
            connection.execute(text(statement))


def add_missing_user_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    columns_to_add = []
    if "two_factor_enabled" not in existing_columns:
        columns_to_add.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE"
        )
    if "two_factor_secret" not in existing_columns:
        columns_to_add.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255)"
        )

    if not columns_to_add:
        return

    with engine.begin() as connection:
        for statement in columns_to_add:
            connection.execute(text(statement))


@app.get("/")
async def root():
    return {
        "message": "Welcome to Digital Farm Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }
