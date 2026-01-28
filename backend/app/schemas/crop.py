from pydantic import BaseModel
from typing import Optional, List

class CropBase(BaseModel):
    name: str
    type: str
    season: str
    duration: str
    water_needs: str
    expected_yield: str
    status: str = "actief"
    icon: str = "🌱"
    description: Optional[str] = None
    soil_temp: Optional[str] = None
    soil_type: Optional[str] = None
    sunlight: Optional[str] = None
    tips: Optional[str] = None

class CropCreate(CropBase):
    pass

class CropUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    season: Optional[str] = None
    duration: Optional[str] = None
    water_needs: Optional[str] = None
    expected_yield: Optional[str] = None
    status: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    soil_temp: Optional[str] = None
    soil_type: Optional[str] = None
    sunlight: Optional[str] = None
    tips: Optional[str] = None

class Crop(CropBase):
    id: int

    class Config:
        from_attributes = True
