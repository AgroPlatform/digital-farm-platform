from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, JSON
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    job_title = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    notification_preferences = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
