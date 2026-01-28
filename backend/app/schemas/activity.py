from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ActivityLogBase(BaseModel):
    activity_type: str
    date: datetime
    area: float
    notes: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    crop_id: int

class ActivityLog(ActivityLogBase):
    id: int
    field_id: int
    crop_id: int

    class Config:
        from_attributes = True

# Schema for assigning a crop to a field
class FieldCropCreate(BaseModel):
    crop_id: int
    planting_date: Optional[date] = None
