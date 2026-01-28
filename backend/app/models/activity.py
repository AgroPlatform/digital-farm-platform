from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

# Association Table for the many-to-many relationship between Field and Crop
field_crop_association = Table(
    'field_crop_association', Base.metadata,
    Column('field_id', Integer, ForeignKey('fields.id'), primary_key=True),
    Column('crop_id', Integer, ForeignKey('crops.id'), primary_key=True),
    Column('planting_date', Date, nullable=True) # Optional: track when this crop was planted in this field
)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    
    activity_type = Column(String, nullable=False) # e.g., "Ploegen", "Zaaien", "Oogsten"
    date = Column(DateTime, nullable=False)
    area = Column(Float, nullable=False) # Hectares worked
    notes = Column(String, nullable=True)

    field = relationship("Field", back_populates="activities")
    crop = relationship("Crop", back_populates="activities")
