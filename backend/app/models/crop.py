from sqlalchemy import Column, Integer, String, Enum, Float, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from .activity import field_crop_association
import enum

class CropType(str, enum.Enum):
    KNOLGEWAS = "Knolgewas"
    GRAAN = "Graan"
    BOLGEWAS = "Bolgewas"
    BLADGROENTE = "Bladgroente"
    PEULVRUCHT = "Peulvrucht"
    FRUIT = "Fruit"
    OVERIG = "Overig"

class Season(str, enum.Enum):
    LENTE = "Lente"
    ZOMER = "Zomer"
    HERFST = "Herfst"
    WINTER = "Winter"
    VOORJAAR = "Voorjaar"

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # We'll store as string to be flexible or use Enum
    season = Column(String)
    duration = Column(String) # e.g. "120 dagen"
    growth_days = Column(Integer, nullable=True, default=90)  # Standard growth period in days
    water_needs = Column(String) # "Low", "Medium", "High"
    expected_yield = Column(String) # "40 ton/ha"
    status = Column(String, default="actief") # "actief", "inactief"
    icon = Column(String, default="🌱") # Emoji icon
    
    # Detail fields
    description = Column(Text, nullable=True)
    soil_temp = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    sunlight = Column(String, nullable=True)
    tips = Column(Text, nullable=True) # Stored as JSON string or text separated by newlines

    # Relationships
    fields = relationship("Field", secondary=field_crop_association, back_populates="crops")
    activities = relationship("ActivityLog", back_populates="crop")
