from datetime import datetime, date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.api.routes.user import get_current_user
from app.db.session import get_db
from app.models.field import Field
from app.models.crop import Crop
from app.models.user import User
from app.models.activity import ActivityLog, field_crop_association
from app.schemas.activity import ActivityLogCreate, ActivityLog as ActivityLogSchema, FieldCropCreate
from app.schemas.crop import Crop as CropSchema


router = APIRouter(prefix="/fields", tags=["Fields"])


# Pydantic models
class FieldBase(BaseModel):
    name: str
    size: float
    soil_type: str
    crops: List[str] = []
    status: str = "actief"
    last_crop: Optional[str] = None
    next_action: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    planting_date: Optional[date] = None
    growth_days: Optional[int] = None


class FieldCreate(FieldBase):
    pass


class FieldUpdate(FieldBase):
    pass


class FieldCropDetail(CropSchema):
    planting_date: Optional[date] = None
    area: Optional[float] = None


def calculate_progress(field: Field) -> int:
    """Calculate progress percentage based on planting date and growth days.
    
    Progress = (days_elapsed / total_growth_days) * 100
    Capped at 100%.
    """
    if not field.planting_date or not field.growth_days or field.growth_days == 0:
        return 0
    
    today = date.today()
    days_elapsed = (today - field.planting_date).days
    
    # Calculate progress as percentage
    progress = int((days_elapsed / field.growth_days) * 100)
    
    # Cap at 100%
    return min(progress, 100)


def attach_progress(field: Field) -> Field:
    """Attach computed progress to a Field instance for API responses."""
    field.progress = calculate_progress(field)
    return field


class FieldResponse(FieldBase):
    id: int
    user_id: int
    progress: int = 0  # Calculated field

    @field_validator('crops', mode='before')
    @classmethod
    def convert_crops_to_strings(cls, v):
        if isinstance(v, list):
            # If the list contains Crop objects, extract the names
            if v and hasattr(v[0], 'name'):
                return [crop.name for crop in v]
            # If it's already strings, return as is
            elif v and isinstance(v[0], str):
                return v
        return v or []

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        """Override to compute progress from Field object."""
        # Create dict from Field object
        data = {}
        if hasattr(obj, '__dict__'):
            for key in obj.__dict__:
                if not key.startswith('_'):
                    data[key] = getattr(obj, key)
        else:
            data = obj
        
        # Calculate progress if it's a Field object
        if hasattr(obj, 'planting_date') and hasattr(obj, 'growth_days'):
            data['progress'] = calculate_progress(obj)
        
        return super().model_validate(data, *args, **kwargs)

    class Config:
        from_attributes = True


class FieldHistoryCreate(BaseModel):
    action: str
    details: Optional[str] = None


class FieldHistoryResponse(BaseModel):
    id: int
    field_id: int
    date: datetime
    action: str
    details: Optional[str]


@router.get("/", response_model=List[FieldResponse])
def get_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all fields for the current user."""
    fields = db.query(Field).filter(Field.user_id == current_user.id).all()
    return [attach_progress(field) for field in fields]


@router.get("/{field_id}", response_model=FieldResponse)
def get_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific field by ID."""
    field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()
    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )
    return attach_progress(field)


@router.post("/", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
def create_field(
    field: FieldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new field."""
    field_data = field.model_dump(exclude={"crops"})
    db_field = Field(
        **field_data,
        user_id=current_user.id
    )
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return attach_progress(db_field)


@router.put("/{field_id}", response_model=FieldResponse)
def update_field(
    field_id: int,
    field_update: FieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing field."""
    db_field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()
    if not db_field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )

    for key, value in field_update.model_dump(exclude_unset=True).items():
        setattr(db_field, key, value)

    db.commit()
    db.refresh(db_field)
    return attach_progress(db_field)
    db.refresh(db_field)
    db_field.progress = calculate_progress(db_field)
    return db_field


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a field."""
    db_field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()
    if not db_field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )

    db.delete(db_field)
    db.commit()
    return None


@router.get("/", response_model=List[FieldResponse])
def get_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all fields for the current user."""
    fields = db.query(Field).filter(Field.user_id == current_user.id).all()
    
    # Add progress to each field
    for field in fields:
        field.progress = calculate_progress(field)
    
    return fields

@router.get("/{field_id}/city")
def get_field_city(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Haal de stad of het dorp van een veld op uit het address veld.
    Neemt het 3e element (index 2) van een komma-gescheiden adres.
    """
    field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )

    address = field.address or ""
    parts = [part.strip() for part in address.split(",")]

    # Pak altijd index 2 of fallback naar index 1 of hele adres
    city = parts[2] if len(parts) > 2 else (parts[1] if len(parts) > 1 else address)

    return {"city": city}

@router.get("/{field_id}", response_model=FieldResponse)
def get_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific field by ID."""
    field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()
    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )
    # Calculate progress
    field.progress = calculate_progress(field)
    return field


@router.post("/", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
def create_field(
    field: FieldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new field."""
    db_field = Field(
        **field.model_dump(),
        user_id=current_user.id
    )
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    db_field.progress = calculate_progress(db_field)
    return db_field


@router.put("/{field_id}", response_model=FieldResponse)
def update_field(
    field_id: int,
    field_update: FieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing field."""
    db_field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()
    if not db_field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )

    for key, value in field_update.model_dump(exclude_unset=True).items():
        setattr(db_field, key, value)

    db.commit()
    db.refresh(db_field)
    db_field.progress = calculate_progress(db_field)
    return db_field


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a field."""
    db_field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user.id
    ).first()
    if not db_field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found"
        )

    db.delete(db_field)
    db.commit()
    return None


# Endpoints for managing crops in fields
@router.post("/{field_id}/crops", response_model=FieldResponse)
def add_crop_to_field(
    field_id: int,
    field_crop: FieldCropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Veld niet gevonden")
        
    db_crop = db.query(Crop).filter(Crop.id == field_crop.crop_id).first()
    if not db_crop:
        raise HTTPException(status_code=404, detail="Gewas niet gevonden")

    # Check if crop is already assigned to the field
    existing_association = db.execute(
        select(field_crop_association).where(
            field_crop_association.c.field_id == field_id,
            field_crop_association.c.crop_id == field_crop.crop_id
        )
    ).first()

    if existing_association:
        raise HTTPException(status_code=400, detail="Dit gewas is al toegevoegd aan dit veld")

    # Calculate total area already used in the field
    total_used_area_result = db.execute(
        select(func.coalesce(func.sum(field_crop_association.c.area), 0)).where(
            field_crop_association.c.field_id == field_id
        )
    ).scalar()
    total_used_area = total_used_area_result or 0

    # Calculate new area
    new_area = field_crop.area or 0
    if new_area <= 0:
        raise HTTPException(status_code=400, detail="Areaal moet groter dan 0 zijn")

    # Check if there is enough space in the field
    if total_used_area + new_area > db_field.size:
        raise HTTPException(
            status_code=400,
            detail="Onvoldoende ruimte in het veld"
        )

    # Add crop to field with planting_date and area
    stmt = field_crop_association.insert().values(
        field_id=field_id,
        crop_id=field_crop.crop_id,
        planting_date=field_crop.planting_date or date.today(),  # Use today if not provided
        area=new_area
    )
    db.execute(stmt)
    db_field.last_crop = db_crop.name
    
    # Set planting_date and growth_days from the crop
    # Use provided planting_date or default to today
    db_field.planting_date = field_crop.planting_date or date.today()
    if db_crop.growth_days:
        db_field.growth_days = db_crop.growth_days
    
    db.add(db_field)
    db.commit()

    # Refresh the field to get updated relationships
    db.refresh(db_field)
    db_field.progress = calculate_progress(db_field)
    return db_field

@router.get("/{field_id}/crops", response_model=List[FieldCropDetail])
def get_field_crops(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Field not found")

    # Query the association table to get crop details with planting_date and area
    query = (
        select(Crop, field_crop_association.c.planting_date, field_crop_association.c.area)
        .join(field_crop_association, Crop.id == field_crop_association.c.crop_id)
        .where(field_crop_association.c.field_id == field_id)
    )
    results = db.execute(query).all()

    crops_with_details = []
    for crop, planting_date, area in results:
        crop_dict = CropSchema.from_orm(crop).dict()
        crop_dict['planting_date'] = planting_date
        crop_dict['area'] = area
        crops_with_details.append(FieldCropDetail(**crop_dict))

    return crops_with_details


# Endpoints for managing activities
@router.post("/{field_id}/activities", response_model=ActivityLogSchema)
def create_activity_for_field(
    field_id: int,
    activity_in: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    db_crop = db.query(Crop).filter(Crop.id == activity_in.crop_id).first()
    if not db_crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    if db_crop not in db_field.crops:
        raise HTTPException(status_code=400, detail="Crop not assigned to this field")

    activity = ActivityLog(
        **activity_in.dict(),
        field_id=field_id
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.get("/{field_id}/activities", response_model=List[ActivityLogSchema])
def get_activities_for_field(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    return db.query(ActivityLog).filter(ActivityLog.field_id == field_id).all()


# Endpoint to remove a crop from a field
@router.delete("/{field_id}/crops/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_crop_from_field(
    field_id: int,
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Veld niet gevonden")
    
    # Check if the crop exists
    db_crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not db_crop:
        raise HTTPException(status_code=404, detail="Gewas niet gevonden")
    
    # Check if the crop is assigned to the field
    existing_association = db.execute(
        select(field_crop_association).where(
            field_crop_association.c.field_id == field_id,
            field_crop_association.c.crop_id == crop_id
        )
    ).first()
    
    if not existing_association:
        raise HTTPException(status_code=400, detail="Dit gewas is niet toegevoegd aan dit veld")
    
    # Remove the association
    stmt = field_crop_association.delete().where(
        field_crop_association.c.field_id == field_id,
        field_crop_association.c.crop_id == crop_id
    )
    db.execute(stmt)
    db.commit()
    return None


