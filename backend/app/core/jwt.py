from datetime import datetime, timedelta
import uuid
from jose import jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db import models as db_models


def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    """Create a JWT access token including a unique `jti` claim."""
    if expires_minutes is not None:
        expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    jti = str(uuid.uuid4())
    to_encode = {"sub": str(subject), "exp": expire, "jti": jti}
    encoded = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


def is_jti_revoked(jti: str, db: Session) -> bool:
    """Check whether a given jti is present in the revoked_tokens table."""
    if not jti:
        return False
    revoked = db.query(db_models.RevokedToken).filter(db_models.RevokedToken.jti == jti).first()
    return revoked is not None
