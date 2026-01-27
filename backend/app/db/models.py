"""Legacy SQLAlchemy models.

IMPORTANT:
- The active Field model lives in `app.models.field.Field` (SQLAlchemy ORM model).
- Keeping a second `Field` model here causes SQLAlchemy to raise:
  "Table 'fields' is already defined for this MetaData instance".

This module is still used for auth/JWT related tables (RevokedToken).
"""

from sqlalchemy import Column, DateTime, Integer, String

from app.db.session import Base


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String, unique=True, nullable=False, index=True)
    revoked_at = Column(DateTime, nullable=False)