from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.db.session import Base


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    size = Column(Float, nullable=False)
    crop = Column(String, nullable=False)
    status = Column(String, default="Actief")
    soil_type = Column(String)
    soil_description = Column(Text)
    last_crop = Column(String)
    next_action = Column(String)
    current_status = Column(String, default="In productie")
    current_crops = Column(Text)  # JSON or comma-separated


class FieldHistory(Base):
    __tablename__ = "field_history"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text)