from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.routes.user import get_current_user
from app.db.session import get_db
from app.models.field import Field
from app.models.crop import Crop
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.activity import ActivityLogCreate, ActivityLog as ActivityLogSchema, FieldCropCreate
from app.schemas.crop import Crop as CropSchema


router = APIRouter(prefix="/fields", tags=["Fields"])

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.routes.user import get_current_user
from app.db.session import get_db
from app.models.field import Field
from app.models.user import User

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


class FieldCreate(FieldBase):
    pass


class FieldUpdate(FieldBase):
    pass


class FieldResponse(FieldBase):
    id: int
    user_id: int

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
    return db.query(Field).filter(Field.user_id == current_user.id).all()


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


class FieldCreate(FieldBase):
    pass


class FieldUpdate(FieldBase):
    pass


class FieldResponse(FieldBase):
    id: int
    user_id: int

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
    return db.query(Field).filter(Field.user_id == current_user.id).all()

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
        raise HTTPException(status_code=404, detail="Field not found")
        
    db_crop = db.query(Crop).filter(Crop.id == field_crop.crop_id).first()
    if not db_crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    if db_crop not in db_field.crops:
        db_field.crops.append(db_crop)
        db.commit()

    return db_field

@router.get("/{field_id}/crops", response_model=List[CropSchema])
def get_field_crops(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Field not found")
    return db_field.crops


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


