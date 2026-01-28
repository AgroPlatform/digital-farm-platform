from sqlalchemy import Column, Integer, String, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from .activity import field_crop_association


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    size = Column(Float, nullable=False)  # in hectares
    soil_type = Column(String(50), nullable=False)
    status = Column(String(20), default="actief")  # actief, inactief
    last_crop = Column(String(255), nullable=True)
    next_action = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    # Relationships
    user = relationship("User", back_populates="fields")
    crops = relationship("Crop", secondary=field_crop_association, back_populates="fields")
    activities = relationship("ActivityLog", back_populates="field", cascade="all, delete-orphan")
