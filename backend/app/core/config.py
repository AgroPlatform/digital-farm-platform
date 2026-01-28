from pydantic_settings import BaseSettings
from pydantic import field_validator, Field, AliasChoices
from typing import List, Any
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/digital_farm",
        validation_alias=AliasChoices(
            "DATABASE_URL",
            "POSTGRES_URL",
            "POSTGRES_PRISMA_URL",
            "DATABASE_URL_UNPOOLED",
            "POSTGRES_URL_NON_POOLING",
            "POSTGRES_URL_NO_SSL",
        ),
    )
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    # include common Vite/React dev ports
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Security / Auth
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SECURE_COOKIE: bool = False

    @field_validator("CORS_ORIGINS", mode="before")
    def _parse_cors_origins(cls, v: Any) -> List[str]:
        """Accept JSON array strings or comma-separated values from env/.env.

        Examples accepted:
        - ['http://x','http://y'] (JSON)
        - http://x,http://y (comma-separated)
        - empty string -> []
        """
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            # Try JSON first
            try:
                parsed = json.loads(s)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                # Fallback to comma-separated
                return [p.strip() for p in s.split(",") if p.strip()]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
